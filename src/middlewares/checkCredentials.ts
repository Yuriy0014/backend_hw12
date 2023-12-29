import bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import {
  notConfirmedAccountQueryRepository,
  userQueryRepository,
} from '../composition-root';
import { HttpStatusCode } from '../constants';
import { LoginInputModel, RequestWithBody } from '../types';
import { mapUserToViewModel } from '../utils';

export const checkCredentials = async (
  req: RequestWithBody<LoginInputModel>,
  res: Response,
  next: NextFunction
) => {
  const { loginOrEmail, password } = req.body;

  const user = await userQueryRepository.getUserByLoginOrEmail(loginOrEmail);

  if (!user) {
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  const notConfirmedAccount =
    await notConfirmedAccountQueryRepository.getNotConfirmedAccountByEmail(
      user.email
    );

  if (notConfirmedAccount) {
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.accountData.password
  );

  if (!isPasswordCorrect) {
    res.sendStatus(HttpStatusCode.Unauthorized);
    return;
  }

  req.user = mapUserToViewModel(user);
  next();
};
