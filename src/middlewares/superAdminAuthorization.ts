import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../constants';

export const superAdminLogin = 'admin';
export const superAdminPassword = 'qwerty';

export const superAdminAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.get('authorization');

  if (auth) {
    const [basic, token] = auth.split(' ');

    if (basic === 'Basic' && token) {
      const [decodedLogin, decodedPassword] = Buffer.from(token, 'base64')
        .toString()
        .split(':');

      if (decodedLogin === superAdminLogin && decodedPassword === superAdminPassword) {
        next();
        return;
      }
    }
  }

  res.sendStatus(HttpStatusCode.Unauthorized);
};
