import { NextFunction, Request, Response } from 'express';
import { sessionQueryRepository } from '../composition-root';
import { HttpStatusCode } from '../constants';

export const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.JWTInfo || {};

  if (!userId) {
    res.sendStatus(HttpStatusCode.Not_Found);
    return;
  }

  const session = await sessionQueryRepository.getSession(
    userId,
    req.params.deviceId
  );

  if (!session) {
    res.sendStatus(HttpStatusCode.Not_Found);
    return;
  }

  if (userId !== session.userId) {
    res.sendStatus(HttpStatusCode.Forbidden);
    return;
  }

  next();
};
