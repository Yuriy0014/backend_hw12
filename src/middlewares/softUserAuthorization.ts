import { NextFunction, Request, Response } from 'express';
import { jwtAdapter, userQueryRepository } from '../composition-root';
import { mapUserToViewModel } from '../utils';

export const softUserAuthorization = async (
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

  next();
};
