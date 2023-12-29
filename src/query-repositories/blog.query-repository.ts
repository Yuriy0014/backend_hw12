import { WithId } from 'mongodb';
import { FilterQuery } from 'mongoose';
import { BlogModel } from '../models';
import { BlogDBModel, BlogQueryParams, Paginator } from '../types';

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
export class BlogQueryRepository {
  async getAllBlogs(
    queryParams?: BlogQueryParams
  ): Promise<Paginator<WithId<BlogDBModel>>> {
    const filter: FilterQuery<BlogDBModel> = {};

    const searchNameTerm = queryParams?.searchNameTerm ?? null;
    const sortBy = queryParams?.sortBy ?? 'createdAt';
    const sortDirection = queryParams?.sortDirection ?? 'desc';
    const pageNumber = Number(queryParams?.pageNumber) || 1;
    const pageSize = Number(queryParams?.pageSize) || 10;

    if (searchNameTerm) {
      filter.name = {
        $regex: searchNameTerm,
        $options: 'i',
      };
    }

    const blogs = await BlogModel.find(filter)
      .sort({
        [sortBy]: sortDirection,
      })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const totalCount = await BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      totalCount,
      pagesCount,
      page: pageNumber,
      pageSize,
      items: blogs,
    };
  }

  async getBlogById(id: string): Promise<WithId<BlogDBModel> | null> {
    return BlogModel.findById(id).lean();
  }
}
