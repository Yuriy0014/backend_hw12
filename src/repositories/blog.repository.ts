import { ObjectId, OptionalId } from 'mongodb';
import { BlogModel } from '../models';
import { BlogDBModel, BlogInputModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class BlogRepository {
  async createBlog(data: OptionalId<BlogDBModel>): Promise<string> {
    const blog = new BlogModel(data);
    await blog.save();

    return blog.id;
  }

  async updateBlogById(id: string, data: BlogInputModel): Promise<boolean> {
    const result = await BlogModel.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const result = await BlogModel.deleteOne({ _id: new ObjectId(id) });

    return result.acknowledged && !!result.deletedCount;
  }
}
