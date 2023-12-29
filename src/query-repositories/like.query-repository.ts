import { WithId } from 'mongodb';
import { LikeStatus, LikeableEntity } from '../constants';
import { LikeModel } from '../models';
import { LikeDBModel, LikeDetails, LikeQueryParams } from '../types';

// Data access layer (query)
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Описывает модели и данные в том формате, в котором они нужны презентационному слою.
// 4. Работа с постраничным выводом, сортировками.
// 5. Возможен маппинг данных.
// 6. Для query-взаимодействия с внешними апишками можно создать отдельный бизнес-сервис под эту апишку
// (напр., VideoQueryService), который работает с несколькими DAL-слоями,
// либо создать запрос в самом QueryRepository.
// 7. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class LikeQueryRepository {
  async getLikes(
    queryParams?: LikeQueryParams
  ): Promise<Array<WithId<LikeDBModel>>> {
    return LikeModel.find(queryParams || {}).lean();
  }

  async getEntitiesLikesCount({
    likeStatus,
    entityType,
  }: {
    likeStatus: LikeStatus;
    entityType: LikeableEntity;
  }): Promise<Record<string, number>> {
    const result = await LikeModel.aggregate([
      {
        $match: {
          likeStatus,
          entityType,
        },
      },
      { $group: { _id: '$entityId', count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          entityId: '$_id',
          count: 1,
        },
      },
    ]); // [ { entityId: '658dc5d44900cf2de93ba71a', count: 1 } ]

    return result.reduce((acc, next) => {
      acc[next.entityId] = next.count;
      return acc;
    }, {});
  }

  async getEntitiesUserLikeStatus({
    userId,
    entityType,
  }: {
    userId: string;
    entityType: LikeableEntity;
  }): Promise<Record<string, LikeStatus>> {
    const result = await LikeModel.aggregate([
      {
        $match: {
          userId,
          entityType,
        },
      },
      {
        $project: {
          _id: 0,
          entityId: '$entityId',
          myStatus: '$likeStatus',
        },
      },
    ]); // [ { entityId: '658dc5d44900cf2de93ba71a', myStatus: 'Like' } ]

    return result.reduce((acc, next) => {
      acc[next.entityId] = next.myStatus;
      return acc;
    }, {});
  }

  async getEntitiesNewestLikes(
    newestLikesCount: number = 3
  ): Promise<Record<string, Array<LikeDetails>>> {
    const result = await LikeModel.aggregate([
      {
        $match: {
          likeStatus: LikeStatus.Like,
        },
      },
      {
        $sort: { addedAt: -1 },
      },
      {
        $group: {
          _id: '$entityId',
          entities: {
            $push: { userId: '$userId', addedAt: '$addedAt', login: '$login' },
          },
        },
      },
      {
        $project: {
          _id: 0,
          entityId: '$_id',
          entities: { $slice: ['$entities', newestLikesCount] },
        },
      },
    ]); // [ { entityId: '658dc5d44900cf2de93ba71a', entities: [ [Object] ] } ]

    return result.reduce((acc, next) => {
      acc[next.entityId] = next.entities;
      return acc;
    }, {});
  }
}
