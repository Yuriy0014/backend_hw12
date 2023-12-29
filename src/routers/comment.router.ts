import { Router } from 'express';
import { commentController, likeController } from '../composition-root';
import { softUserAuthorization, userAuthorization } from '../middlewares';
import { commentValidator, likeStatusValidator } from '../validators';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const commentRouter = Router();

commentRouter.get(
  '/',
  softUserAuthorization,
  commentController.getComments.bind(commentController)
);

commentRouter.get(
  '/:id',
  softUserAuthorization,
  commentController.getComment.bind(commentController)
);

commentRouter.put(
  '/:id',
  userAuthorization,
  commentValidator(),
  commentController.updateComment.bind(commentController)
);

commentRouter.delete(
  '/:id',
  userAuthorization,
  commentController.deleteComment.bind(commentController)
);

commentRouter.put(
  '/:commentId/like-status',
  userAuthorization,
  likeStatusValidator(),
  likeController.updateCommentLikeStatus.bind(likeController)
);
