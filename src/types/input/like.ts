import { LikeStatus, LikeableEntity } from '../../constants';

export type LikeInputModel = {
  likeStatus: LikeStatus;
};

export type LikeQueryParams = {
  entityId?: string;
  entityType?: LikeableEntity;
  userId?: string;
  login?: string;
  addedAt?: Date;
  likeStatus?: LikeStatus;
};
