import { Schema, model } from 'mongoose';
import { LikeStatus, LikeableEntity } from '../constants';
import { LikeDBModel } from '../types';

export const LikeSchema = new Schema<LikeDBModel>(
  {
    entityId: { type: String, required: true },
    entityType: {
      type: String,
      required: true,
      of: Object.values(LikeableEntity),
    },
    userId: { type: String, required: true },
    login: { type: String, required: true },
    addedAt: { type: Date, required: true },
    likeStatus: {
      type: String,
      required: true,
      of: [LikeStatus.Like, LikeStatus.Dislike],
    },
  },
  { versionKey: false }
);

export const LikeModel = model<LikeDBModel>('likes', LikeSchema);
