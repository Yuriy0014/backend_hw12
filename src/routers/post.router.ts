import { Router } from 'express';
import { likeController, postController } from '../composition-root';
import {
  softUserAuthorization,
  superAdminAuthorization,
  userAuthorization,
} from '../middlewares';
import {
  commentValidator,
  likeStatusValidator,
  postValidator,
} from '../validators';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const postRouter = Router();

postRouter.get(
  '/',
  softUserAuthorization,
  postController.getPosts.bind(postController)
);

postRouter.get(
  '/:id',
  softUserAuthorization,
  postController.getPost.bind(postController)
);

postRouter.post(
  '/',
  superAdminAuthorization,
  postValidator(),
  postController.createPost.bind(postController)
);

postRouter.put(
  '/:id',
  superAdminAuthorization,
  postValidator(),
  postController.updatePost.bind(postController)
);

postRouter.delete(
  '/:id',
  superAdminAuthorization,
  postController.deletePost.bind(postController)
);

postRouter.get(
  '/:postId/comments',
  userAuthorization,
  postController.getPostComments.bind(postController)
);

postRouter.post(
  '/:postId/comments',
  userAuthorization,
  commentValidator(),
  postController.createComment.bind(postController)
);

postRouter.put(
  '/:postId/like-status',
  userAuthorization,
  likeStatusValidator(),
  likeController.updatePostLikeStatus.bind(likeController)
);
