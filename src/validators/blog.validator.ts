import { body } from 'express-validator';
import { inputValidator } from './input.validator';

export const blogValidator = () => {
  return [
    body('name')
      .isString()
      .trim()
      .withMessage('Invalid name.')
      .isLength({ min: 1, max: 15 })
      .withMessage('Invalid name.'),
    body('description')
      .isString()
      .trim()
      .withMessage('Invalid description.')
      .isLength({ min: 1, max: 500 })
      .withMessage('Invalid description.'),
    body('websiteUrl')
      .isString()
      .trim()
      .withMessage('Invalid websiteUrl.')
      .isLength({ min: 1, max: 100 })
      .withMessage('Invalid websiteUrl.')
      .matches('^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$')
      .withMessage('Invalid websiteUrl.'),
    inputValidator,
  ];
};

export const blogPostValidator = () => {
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
    inputValidator,
  ];
};
