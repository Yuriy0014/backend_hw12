import { NextFunction, Request, Response } from 'express';
import {
  expiredTokenQueryRepository,
  expiredTokenService,
  jwtAdapter,
} from '../composition-root';
import { HttpStatusCode } from '../constants';

export const checkRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  const expiredToken = await expiredTokenQueryRepository.getExpiredToken(
    refreshToken
  );

  if (expiredToken) {
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  const JWTInfo = await jwtAdapter.getJWTInfo(refreshToken);

  if (!JWTInfo) {
    await expiredTokenService.createExpiredToken(refreshToken);
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  req.JWTInfo = {
    userId: JWTInfo.userId,
    deviceId: JWTInfo.deviceId,
  };
  next();
};
