import { body } from 'express-validator';
import { inputValidator } from './input.validator';

export const commentValidator = () => {
  return [
    body('content')
      .isString()
      .trim()
      .withMessage('Invalid content.')
      .isLength({ min: 20, max: 300 })
      .withMessage('Invalid content.'),
    inputValidator,
  ];
};
