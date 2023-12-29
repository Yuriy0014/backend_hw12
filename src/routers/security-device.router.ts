import { Router } from 'express';
import { sessionController } from '../composition-root';
import { checkRefreshToken, checkSession } from '../middlewares';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const securityDeviceRouter = Router();

securityDeviceRouter.get(
  '/',
  checkRefreshToken,
  sessionController.getUserSessions.bind(sessionController)
);

securityDeviceRouter.delete(
  '/',
  checkRefreshToken,
  sessionController.terminateAllOtherSessions.bind(sessionController)
);

securityDeviceRouter.delete(
  '/:deviceId',
  checkRefreshToken,
  checkSession,
  sessionController.terminateSession.bind(sessionController)
);
