import { Router } from 'express';
import { likeController } from '../composition-root';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const likeRouter = Router();

likeRouter.get(
  '/:userId/posts',
  likeController.getUserLikedPosts.bind(likeController)
);

likeRouter.put(
  '/:postId',
  likeController.updatePostLikeStatus.bind(likeController)
);
