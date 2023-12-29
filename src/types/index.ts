import { Request } from 'express';
import { LikeStatus } from '../constants';

export { ApiAccessDBModel } from './db/api-access';
export { BlogDBModel } from './db/blog';
export { CommentDBModel } from './db/comment';
export { ExpiredTokenDBModel } from './db/expired-token';
export { LikeDBModel } from './db/like';
export { NotConfirmedAccountDBModel } from './db/not-confirmed-account';
export { NotRecoveredPasswordDBModel } from './db/not-recovered-password';
export { PostDBModel } from './db/post';
export { SessionDBModel } from './db/session';
export { UserDBModel } from './db/user';
export {
  LoginInputModel,
  NewPasswordRecoveryInputModel,
  PasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
} from './input/auth';
export {
  BlogInputModel,
  BlogPostInputModel,
  BlogQueryParams,
} from './input/blog';
export { CommentInputModel, CommentQueryParams } from './input/comment';
export { LikeInputModel, LikeQueryParams } from './input/like';
export { PostInputModel, PostQueryParams } from './input/post';
export { UserInputModel, UserQueryParams } from './input/user';
export { LoginSuccessViewModel, MeViewModel } from './view/auth';
export { BlogViewModel } from './view/blog';
export { CommentViewModel } from './view/comment';
export { DeviceViewModel } from './view/device';
export { PostViewModel } from './view/post';
export { UserViewModel } from './view/user';

export type FieldError = {
  message: string | null;
  field: string | null;
};

export type ErrorResult = {
  errorsMessages: Array<FieldError> | null;
};

export type Paginator<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<T>;
};

export type SortDirection = 'asc' | 'desc';

export type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
};

export type LikeDetails = {
  addedAt: string;
  userId: string | null;
  login: string | null;
};

export type ExtendedLikesInfo = LikesInfo & {
  newestLikes: Array<LikeDetails>;
};

export type EntitiesLikesInfo = {
  likes: Record<string, number>;
  dislikes: Record<string, number>;
  userLikeStatus: Record<string, LikeStatus>;
  newestLikes?: Record<string, Array<LikeDetails>>;
};

export type RequestWithParams<P> = Request<P>;
export type RequestWithQuery<Q> = Request<{}, {}, {}, Q>;
export type RequestWithBody<B> = Request<{}, {}, B>;
export type RequestWithParamsAndBody<P, B> = Request<P, {}, B>;
export type RequestWithParamsAndQuery<P, Q> = Request<P, {}, {}, Q>;
