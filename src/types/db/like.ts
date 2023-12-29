import { LikeStatus, LikeableEntity } from '../../constants';

export type LikeDBModel = {
  entityId: string;
  entityType: LikeableEntity;
  userId: string;
  login: string;
  addedAt: Date;
  likeStatus: LikeStatus.Like | LikeStatus.Dislike;
};
