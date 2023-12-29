import { ObjectId } from 'mongodb';
import { CommentModel } from '../models';
import { CommentInputModel, LikesInfo } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class CommentRepository {
  async updateCommentById(
    id: string,
    data: CommentInputModel
  ): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async updateCommentLikes(
    id: string,
    likesInfo: Omit<LikesInfo, 'myStatus'>
  ): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { _id: new ObjectId(id) },
      { likesInfo }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({ _id: new ObjectId(id) });

    return result.acknowledged && !!result.deletedCount;
  }

  async updateCommentLikeActivity(
    id: string,
    data: { likesInfo: Omit<LikesInfo, 'myStatus'> }
  ): Promise<boolean> {
    const result = await CommentModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }
}
