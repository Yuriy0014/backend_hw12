import { Router } from 'express';
import { userController } from '../composition-root';
import { superAdminAuthorization } from '../middlewares';
import { userValidator } from '../validators';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const userRouter = Router();

userRouter.get(
  '/',
  superAdminAuthorization,
  userController.getUsers.bind(userController)
);

userRouter.get(
  '/:id',
  superAdminAuthorization,
  userController.getUser.bind(userController)
);

userRouter.post(
  '/',
  superAdminAuthorization,
  userValidator(),
  userController.createUser.bind(userController)
);

userRouter.delete(
  '/:id',
  superAdminAuthorization,
  userController.deleteUser.bind(userController)
);
