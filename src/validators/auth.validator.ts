import { body } from 'express-validator';
import {
  notConfirmedAccountQueryRepository,
  notRecoveredPasswordQueryRepository,
  userQueryRepository,
} from '../composition-root';
import { inputValidator } from './input.validator';

export const registrationValidator = () => {
  return [
    body('login')
      .isString()
      .trim()
      .withMessage('Invalid login.')
      .isLength({ min: 3, max: 10 })
      .withMessage('Invalid login.')
      .matches(/^[a-zA-Z0-9_-]*$/)
      .withMessage('Invalid login.')
      .custom(async (login: string) => {
        const user = await userQueryRepository.getUserByLoginOrEmail(login);

        if (user) {
          throw new Error('Such login already exists.');
        }

        return true;
      }),
    body('password')
      .isString()
      .trim()
      .withMessage('Invalid password.')
      .isLength({ min: 6, max: 20 })
      .withMessage('Invalid password.'),
    body('email')
      .isString()
      .trim()
      .withMessage('Invalid email.')
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      .withMessage('Invalid email.')
      .custom(async (email: string) => {
        const user = await userQueryRepository.getUserByLoginOrEmail(email);

        if (user) {
          throw new Error('Such email already exists.');
        }

        return true;
      }),
    inputValidator,
  ];
};

export const registrationConfirmationValidator = () => {
  return [
    body('code')
      .isString()
      .trim()
      .withMessage('Invalid code.')
      .custom(async (code: string) => {
        const notConfirmedAccount =
          await notConfirmedAccountQueryRepository.getNotConfirmedAccountByCode(
            code
          );

        if (!notConfirmedAccount) {
          throw new Error('Account is already confirmed.');
        }

        if (notConfirmedAccount.expiryDate <= new Date()) {
          throw new Error('Code is expired.');
        }

        return true;
      }),
    inputValidator,
  ];
};

export const registrationEmailResendingValidator = () => {
  return [
    body('email')
      .isString()
      .trim()
      .withMessage('Invalid email.')
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      .withMessage('Invalid email.')
      .custom(async (email: string) => {
        const notConfirmedAccount =
          await notConfirmedAccountQueryRepository.getNotConfirmedAccountByEmail(
            email
          );

        if (!notConfirmedAccount) {
          throw new Error('Account is already confirmed.');
        }

        return true;
      }),
    inputValidator,
  ];
};

export const passwordRecoveryValidator = () => {
  return [
    body('email')
      .isString()
      .trim()
      .withMessage('Invalid email.')
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
      .withMessage('Invalid email.'),
    inputValidator,
  ];
};

export const newPasswordRecoveryValidator = () => {
  return [
    body('newPassword')
      .isString()
      .trim()
      .withMessage('Invalid newPassword.')
      .isLength({ min: 6, max: 20 })
      .withMessage('Invalid newPassword.'),
    body('recoveryCode')
      .isString()
      .trim()
      .withMessage('Invalid recoveryCode.')
      .custom(async (recoveryCode: string) => {
        const notRecoveredPassword =
          await notRecoveredPasswordQueryRepository.getNotRecoveredPasswordByCode(
            recoveryCode
          );

        if (!notRecoveredPassword) {
          throw new Error('Recovery code is incorrect.');
        }

        if (notRecoveredPassword.expiryDate <= new Date()) {
          throw new Error('Recovery code is expired.');
        }

        return true;
      }),
    inputValidator,
  ];
};
