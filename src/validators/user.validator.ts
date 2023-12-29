import { body } from 'express-validator';
import { inputValidator } from './input.validator';

export const userValidator = () => {
  return [
    body('login')
      .isString()
      .trim()
      .withMessage('Invalid login.')
      .isLength({ min: 3, max: 10 })
      .withMessage('Invalid login.')
      .matches(/^[a-zA-Z0-9_-]*$/)
      .withMessage('Invalid login.'),
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
      .withMessage('Invalid email.'),
    inputValidator,
  ];
};
