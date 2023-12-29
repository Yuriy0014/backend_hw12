import { WithId } from 'mongodb';
import { CommentModel, PostModel } from '../models';
import {
  CommentDBModel,
  CommentQueryParams,
  Paginator,
  PostDBModel,
  PostQueryParams,
} from '../types';

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
export class PostQueryRepository {
  async getAllPosts(
    queryParams?: PostQueryParams
  ): Promise<Paginator<WithId<PostDBModel>>> {
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    const posts = await PostModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await PostModel.countDocuments();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts,
    };
  }

  async getPostsByBlogId(
    blogId: string,
    queryParams?: PostQueryParams
  ): Promise<Paginator<WithId<PostDBModel>>> {
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    const posts = await PostModel.find({ blogId })
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await PostModel.countDocuments({ blogId });
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts,
    };
  }

  async getPostById(id: string): Promise<WithId<PostDBModel> | null> {
    return PostModel.findById(id).lean();
  }

  async getCommentsByPostId(
    postId: string,
    queryParams?: CommentQueryParams
  ): Promise<Paginator<WithId<CommentDBModel>>> {
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    const comments = await CommentModel.find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await CommentModel.countDocuments({ postId });
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments,
    };
  }
}
