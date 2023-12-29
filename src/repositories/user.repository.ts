import { ObjectId, OptionalId } from 'mongodb';
import { LikeStatus } from '../constants';
import { UserModel } from '../models';
import { UserDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class UserRepository {
  async createUser(data: OptionalId<UserDBModel>): Promise<string> {
    const user = new UserModel(data);
    await user.save();

    return user.id;
  }

  async updateUserPasswordByEmail(
    email: string,
    password: string
  ): Promise<boolean> {
    const result = await UserModel.updateOne(
      { email },
      { 'accountData.password': password }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deleteUserById(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: new ObjectId(id) });

    return result.acknowledged && !!result.deletedCount;
  }

  async updateUserCommentLikeStatus(
    userId: string,
    commentId: string,
    likeStatus?: LikeStatus
  ): Promise<boolean> {
    const options = likeStatus
      ? {
          $set: {
            [`activityData.comments.likeActivity.${commentId}`]: likeStatus,
          },
        }
      : {
          $unset: {
            [`activityData.comments.likeActivity.${commentId}`]: '',
          },
        };

    const result = await UserModel.updateOne(
      {
        _id: new ObjectId(userId),
      },
      options
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async updateUserPostLikeStatus(
    userId: string,
    postId: string,
    likeStatus?: LikeStatus
  ): Promise<boolean> {
    const options = likeStatus
      ? {
          $set: {
            [`activityData.posts.likeActivity.${postId}`]: likeStatus,
          },
        }
      : {
          $unset: {
            [`activityData.posts.likeActivity.${postId}`]: '',
          },
        };

    const result = await UserModel.updateOne(
      {
        _id: new ObjectId(userId),
      },
      options
    );

    return result.acknowledged && !!result.modifiedCount;
  }
}
