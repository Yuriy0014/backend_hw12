import { OptionalId } from 'mongodb';
import { BlogRepository } from '../repositories';
import { BlogDBModel, BlogInputModel } from '../types';

type BlogServiceArgs = {
  blogRepository: BlogRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class BlogService {
  protected blogRepository;
  constructor({ blogRepository }: BlogServiceArgs) {
    this.blogRepository = blogRepository;
  }
  async createBlog({
    description,
    name,
    websiteUrl,
  }: BlogInputModel): Promise<string> {
    const newBlogData: OptionalId<BlogDBModel> = {
      description,
      name,
      websiteUrl,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    return this.blogRepository.createBlog(newBlogData);
  }

  async updateBlogById(id: string, data: BlogInputModel): Promise<boolean> {
    return this.blogRepository.updateBlogById(id, data);
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return this.blogRepository.deleteBlogById(id);
  }
}
