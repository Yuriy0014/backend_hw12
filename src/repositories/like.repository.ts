import { OptionalId } from 'mongodb';
import { LikeableEntity } from '../constants';
import { LikeModel } from '../models';
import { LikeDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class LikeRepository {
  async createLike(data: OptionalId<LikeDBModel>): Promise<boolean> {
    const likeInfo = new LikeModel(data);
    await likeInfo.save();

    return !!likeInfo.id;
  }

  async deleteLike({
    userId,
    entityId,
    entityType,
  }: {
    userId: string;
    entityId: string;
    entityType: LikeableEntity;
  }): Promise<boolean> {
    const result = await LikeModel.deleteOne({
      userId,
      entityId,
      entityType,
    });

    return result.acknowledged && !!result.deletedCount;
  }
}
