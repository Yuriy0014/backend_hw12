import { Response, Router } from 'express';
import { HttpStatusCode } from '../constants';
import {
  ApiAccessModel,
  BlogModel,
  CommentModel,
  ExpiredTokenModel,
  LikeModel,
  NotConfirmedAccountModel,
  PostModel,
  SessionModel,
  UserModel,
} from '../models';

// Presentation layer - исключительно коммуникация по http / graphQL / webSocket (запрос - ответ).
export const testingRouter = Router();

testingRouter.delete('/', async (_, res: Response) => {
  await BlogModel.deleteMany();
  await PostModel.deleteMany();
  await UserModel.deleteMany();
  await CommentModel.deleteMany();
  await ExpiredTokenModel.deleteMany();
  await NotConfirmedAccountModel.deleteMany();
  await SessionModel.deleteMany();
  await ApiAccessModel.deleteMany();
  await LikeModel.deleteMany();
  res.sendStatus(HttpStatusCode.No_Content);
});
