import { OptionalId } from 'mongodb';
import { BlogQueryRepository } from '../query-repositories';
import { PostRepository } from '../repositories';
import {
  CommentDBModel,
  CommentInputModel,
  CommentatorInfo,
  PostDBModel,
  PostInputModel,
} from '../types';

type PostServiceArgs = {
  postRepository: PostRepository;
  blogQueryRepository: BlogQueryRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class PostService {
  protected postRepository;
  protected blogQueryRepository;
  constructor({ postRepository, blogQueryRepository }: PostServiceArgs) {
    this.postRepository = postRepository;
    this.blogQueryRepository = blogQueryRepository;
  }
  async createPost({
    blogId,
    content,
    shortDescription,
    title,
  }: PostInputModel): Promise<string | null> {
    const foundBlog = await this.blogQueryRepository.getBlogById(blogId);

    if (!foundBlog) {
      return null;
    }

    const blogName = foundBlog.name;

    const newPostData: OptionalId<PostDBModel> = {
      blogId,
      content,
      shortDescription,
      title,
      createdAt: new Date().toISOString(),
      blogName,
    };

    return this.postRepository.createPost(newPostData);
  }

  async updatePostById(id: string, data: PostInputModel): Promise<boolean> {
    return this.postRepository.updatePostById(id, data);
  }

  async deletePostById(id: string): Promise<boolean> {
    return this.postRepository.deletePostById(id);
  }

  async createComment(
    postId: string,
    { content }: CommentInputModel,
    { userId, userLogin }: CommentatorInfo
  ): Promise<string> {
    const newCommentData: OptionalId<CommentDBModel> = {
      content,
      commentatorInfo: {
        userId,
        userLogin,
      },
      createdAt: new Date().toISOString(),
      postId,
    };

    return this.postRepository.createComment(newCommentData);
  }
}
