import { ObjectId, WithId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { LikeStatus } from '../constants';
import { UserModel } from '../models';
import { Paginator, UserDBModel } from '../types';
import { UserQueryParams } from '../types/input/user';

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
export class UserQueryRepository {
  async getAllUsers(
    queryParams?: UserQueryParams
  ): Promise<Paginator<WithId<UserDBModel>>> {
    const filter: FilterQuery<UserDBModel> = {};

    const searchLoginTerm = queryParams?.searchLoginTerm ?? null;
    const searchEmailTerm = queryParams?.searchEmailTerm ?? null;
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    if (searchLoginTerm) {
      if (!Array.isArray(filter['$or'])) {
        filter['$or'] = [];
      }

      filter['$or'].push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      if (!Array.isArray(filter['$or'])) {
        filter['$or'] = [];
      }

      filter['$or'].push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    const users = await UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      totalCount,
      pagesCount,
      page: pageNumber,
      pageSize,
      items: users,
    };
  }

  async getUserById(id: string): Promise<WithId<UserDBModel> | null> {
    return UserModel.findById(id).lean();
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<WithId<UserDBModel> | null> {
    return UserModel.findOne({
      $or: [{ 'accountData.login': loginOrEmail }, { email: loginOrEmail }],
    }).lean();
  }

  async getUserCommentLikeStatus(
    userId: string,
    commentId: string
  ): Promise<LikeStatus | null> {
    const user = UserModel.findOne({
      _id: new ObjectId(userId),
    }).exec();

    return user.then((foundUser) => {
      if (!foundUser?.get(`activityData.comments.likeActivity.${commentId}`)) {
        return null;
      }

      return foundUser.get(`activityData.comments.likeActivity.${commentId}`);
    });
  }

  async getUserPostLikeStatus(
    userId: string,
    postId: string
  ): Promise<LikeStatus | null> {
    const user = UserModel.findOne({
      _id: new ObjectId(userId),
    }).exec();

    return user.then((foundUser) => {
      if (!foundUser?.get(`activityData.posts.likeActivity.${postId}`)) {
        return null;
      }

      return foundUser.get(`activityData.posts.likeActivity.${postId}`);
    });
  }
}
