import { OptionalId } from 'mongodb';
import { LikeStatus, LikeableEntity } from '../constants';
import { LikeQueryRepository } from '../query-repositories';
import { LikeRepository } from '../repositories';
import { EntitiesLikesInfo, LikeDBModel } from '../types';

type LikeServiceArgs = {
  likeQueryRepository: LikeQueryRepository;
  likeRepository: LikeRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class LikeService {
  protected likeRepository;
  protected likeQueryRepository;
  constructor({ likeRepository, likeQueryRepository }: LikeServiceArgs) {
    this.likeRepository = likeRepository;
    this.likeQueryRepository = likeQueryRepository;
  }

  async updateLikeEntity({
    entityId,
    entityType,
    likeStatus,
    userId,
    login,
  }: {
    entityId: string;
    entityType: LikeableEntity;
    userId: string;
    likeStatus: LikeStatus;
    login: string;
  }): Promise<boolean> {
    const possibleLikes = await this.likeQueryRepository.getLikes({
      entityId,
      userId,
      entityType,
    });

    if (!possibleLikes.length) {
      switch (likeStatus) {
        case LikeStatus.Like:
        case LikeStatus.Dislike: {
          const newLikeData: OptionalId<LikeDBModel> = {
            entityId,
            entityType,
            likeStatus,
            userId,
            addedAt: new Date(),
            login,
          };

          return this.likeRepository.createLike(newLikeData);
        }
        case LikeStatus.None:
          return true;
        default:
          throw new Error('Such status does not exist');
      }
    }

    if (likeStatus === LikeStatus.None) {
      return this.likeRepository.deleteLike({ userId, entityId, entityType });
    }

    if (possibleLikes[0].likeStatus === likeStatus) {
      return true;
    }

    await this.likeRepository.deleteLike({ userId, entityId, entityType });

    const updatedLikeData: OptionalId<LikeDBModel> = {
      entityId,
      entityType,
      likeStatus,
      userId,
      addedAt: new Date(),
      login,
    };

    return this.likeRepository.createLike(updatedLikeData);
  }

  async createEntitiesLikesInfo({
    userId,
    entityType,
    isExtended = false,
  }: {
    userId: string | null;
    entityType: LikeableEntity;
    isExtended?: boolean;
  }): Promise<EntitiesLikesInfo> {
    const [entitiesLikes, entitiesDislikes] = await Promise.all([
      this.likeQueryRepository.getEntitiesLikesCount({
        likeStatus: LikeStatus.Like,
        entityType,
      }),
      this.likeQueryRepository.getEntitiesLikesCount({
        likeStatus: LikeStatus.Dislike,
        entityType,
      }),
    ]);

    const entitiesUserLikeStatus =
      userId === null
        ? {}
        : await this.likeQueryRepository.getEntitiesUserLikeStatus({
            userId,
            entityType,
          });

    const entitiesLikesInfo: EntitiesLikesInfo = {
      likes: entitiesLikes,
      dislikes: entitiesDislikes,
      userLikeStatus: entitiesUserLikeStatus,
    };

    if (isExtended) {
      const entitiesNewestLikes =
        await this.likeQueryRepository.getEntitiesNewestLikes();
      entitiesLikesInfo.newestLikes = entitiesNewestLikes;
    }

    return entitiesLikesInfo;
  }
}
