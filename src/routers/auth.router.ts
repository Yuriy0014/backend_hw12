import { Router } from 'express';
import { authController } from '../composition-root';
import {
  checkCredentials,
  checkRefreshToken,
  ipLimit,
  userAuthorization,
} from '../middlewares';
import {
  newPasswordRecoveryValidator,
  passwordRecoveryValidator,
  registrationConfirmationValidator,
  registrationEmailResendingValidator,
  registrationValidator,
} from '../validators';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const authRouter = Router();

const limiter = ipLimit({
  requestsCountLimit: 5,
  timeLimitSec: 10,
});

authRouter.post(
  '/registration',
  limiter,
  registrationValidator(),
  authController.registerUser.bind(authController)
);

authRouter.post(
  '/registration-confirmation',
  limiter,
  registrationConfirmationValidator(),
  authController.confirmRegistration.bind(authController)
);

authRouter.post(
  '/registration-email-resending',
  limiter,
  registrationEmailResendingValidator(),
  authController.resendRegistrationEmail.bind(authController)
);

authRouter.post(
  '/password-recovery',
  limiter,
  passwordRecoveryValidator(),
  authController.recoverPassword.bind(authController)
);

authRouter.post(
  '/new-password',
  limiter,
  newPasswordRecoveryValidator(),
  authController.confirmNewPassword.bind(authController)
);

authRouter.post(
  '/login',
  limiter,
  checkCredentials,
  authController.login.bind(authController)
);

authRouter.post(
  '/refresh-token',
  checkRefreshToken,
  authController.refreshToken.bind(authController)
);

authRouter.get(
  '/me',
  userAuthorization,
  authController.authMe.bind(authController)
);

authRouter.post(
  '/logout',
  checkRefreshToken,
  authController.logout.bind(authController)
);
