import { body } from 'express-validator';
import { blogQueryRepository } from '../composition-root';
import { inputValidator } from './input.validator';

export const postValidator = () => {
  return [
    body('title')
      .isString()
      .trim()
      .withMessage('Invalid title.')
      .isLength({ min: 1, max: 30 })
      .withMessage('Invalid title.'),
    body('shortDescription')
      .isString()
      .trim()
      .withMessage('Invalid shortDescription.')
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid shortDescription.'),
    body('content')
      .isString()
      .trim()
      .withMessage('Invalid content.')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Invalid content.'),
    body('blogId')
      .isString()
      .trim()
      .withMessage('Invalid blogId.')
      .custom(async (id: string) => {
        const blog = await blogQueryRepository.getBlogById(id);

        if (!blog) {
          throw new Error('Invalid blogId.');
        }

        return true;
      }),
    inputValidator,
  ];
};
