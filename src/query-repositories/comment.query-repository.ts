import { WithId } from 'mongodb';
import { CommentModel } from '../models';
import { CommentDBModel, CommentQueryParams, Paginator } from '../types';

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
export class CommentQueryRepository {
  async getAllComments(
    queryParams?: CommentQueryParams
  ): Promise<Paginator<WithId<CommentDBModel>>> {
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    const comments = await CommentModel.find()
      .sort({ [sortBy]: sortDirection })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await CommentModel.countDocuments();
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: comments,
    };
  }

  async getCommentById(id: string): Promise<WithId<CommentDBModel> | null> {
    return CommentModel.findById(id).lean();
  }
}
