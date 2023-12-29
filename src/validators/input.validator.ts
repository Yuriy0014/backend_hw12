import { NextFunction, Request, Response } from 'express';
import { Result, validationResult } from 'express-validator';
import { HttpStatusCode } from '../constants';
import { FieldError } from '../types';

export const inputValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const result: Result = validationResult(req);

  if (result.isEmpty()) {
    next();
    return;
  }

  const errors: Result<FieldError> = result.formatWith((error) => ({
    field: error.type === 'field' ? error.path : 'unknown field',
    message: error.msg,
  }));

  res
    .status(HttpStatusCode.Bad_Request)
    .json({ errorsMessages: errors.array({ onlyFirstError: true }) });
};
