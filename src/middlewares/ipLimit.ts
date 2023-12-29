import { NextFunction, Request, Response } from 'express';
import {
  apiAccessQueryRepository,
  apiAccessService,
} from '../composition-root';
import { HttpStatusCode } from '../constants';

export const ipLimit =
  ({
    requestsCountLimit,
    timeLimitSec,
  }: {
    requestsCountLimit: number;
    timeLimitSec: number;
  }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'defaultIP';
    const url = req.originalUrl.split('?')[0];

    await apiAccessService.createApiAccess({
      ip,
      url,
      date: new Date(),
    });

    const accessesCount = await apiAccessQueryRepository.getApiAccessesCount({
      ip,
      url,
      timeLimit: timeLimitSec,
    });

    if (accessesCount > requestsCountLimit) {
      res.sendStatus(HttpStatusCode.Too_Many_Requests);
      return;
    }

    next();
  };
