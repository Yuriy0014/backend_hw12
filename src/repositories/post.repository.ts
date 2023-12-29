import { ObjectId } from 'mongodb';
import { CommentModel, PostModel } from '../models';
import {
  CommentDBModel,
  ExtendedLikesInfo,
  PostDBModel,
  PostInputModel,
} from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class PostRepository {
  async createPost(data: PostDBModel): Promise<string> {
    const post = new PostModel(data);
    await post.save();

    return post.id;
  }

  async updatePostById(id: string, data: PostInputModel): Promise<boolean> {
    const result = await PostModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deletePostById(id: string): Promise<boolean> {
    const result = await PostModel.deleteOne({ _id: new ObjectId(id) });

    return result.acknowledged && !!result.deletedCount;
  }

  async createComment(data: CommentDBModel): Promise<string> {
    const comment = new CommentModel(data);
    await comment.save();

    return comment.id;
  }

  async updatePostLikeActivity(
    id: string,
    data: { extendedLikesInfo: Omit<ExtendedLikesInfo, 'myStatus'> }
  ): Promise<boolean> {
    const result = await PostModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }
}
