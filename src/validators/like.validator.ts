import { body } from 'express-validator';
import { LikeStatus } from '../constants';
import { inputValidator } from './input.validator';

export const likeStatusValidator = () => {
  return [
    body('likeStatus')
      .isString()
      .trim()
      .withMessage('Invalid likeStatus.')
      .isIn(Object.values(LikeStatus))
      .withMessage('Invalid likeStatus.'),
    inputValidator,
  ];
};
