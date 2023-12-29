import { CommentRepository } from '../repositories';
import { CommentInputModel, LikesInfo } from '../types';

type CommentServiceArgs = {
  commentRepository: CommentRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class CommentService {
  protected commentRepository;

  constructor({ commentRepository }: CommentServiceArgs) {
    this.commentRepository = commentRepository;
  }
  async updateCommentById(
    id: string,
    data: CommentInputModel
  ): Promise<boolean> {
    return this.commentRepository.updateCommentById(id, data);
  }

  async updateCommentLikes(
    id: string,
    likesInfo: Omit<LikesInfo, 'myStatus'>
  ): Promise<boolean> {
    return this.commentRepository.updateCommentLikes(id, likesInfo);
  }

  async deleteCommentById(id: string): Promise<boolean> {
    return this.commentRepository.deleteCommentById(id);
  }
}
