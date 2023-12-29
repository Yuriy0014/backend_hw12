import { NextFunction, Request, Response } from 'express';
import { jwtAdapter, userQueryRepository } from '../composition-root';
import { HttpStatusCode } from '../constants';
import { mapUserToViewModel } from '../utils';

export const userAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = req.get('authorization');

  if (auth) {
    const [bearer, token] = auth.split(' ');

    if (bearer === 'Bearer' && token) {
      const userId = await jwtAdapter.getUserIdByToken(token);

      if (userId) {
        const user = await userQueryRepository.getUserById(userId);

        if (user) {
          req.user = mapUserToViewModel(user);
          next();
          return;
        }
      }
    }
  }

  res.sendStatus(HttpStatusCode.Unauthorized);
};
