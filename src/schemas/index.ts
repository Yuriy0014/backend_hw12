import { Schema } from 'mongoose';
import { CommentatorInfo } from '../types';

export const CommentatorInfoSchema = new Schema<CommentatorInfo>({
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
});

// export const LikesInfoSchema = new Schema<LikesInfo>({
//   likesCount: { type: Number, required: true },
//   dislikesCount: { type: Number, required: true },
//   myStatus: {
//     type: String,
//     required: true,
//     enum: Object.values(LikeStatus),
//     default: LikeStatus.None,
//   },
// });

// const LikeDetailsSchema = new Schema<LikeDetails>({
//   addedAt: { type: String, required: true },
//   userId: { type: String },
//   login: { type: String },
// });

// export const ExtendedLikesInfoSchema = new Schema<ExtendedLikesInfo>({
//   likesCount: { type: Number, required: true },
//   dislikesCount: { type: Number, required: true },
//   myStatus: {
//     type: String,
//     required: true,
//     enum: Object.values(LikeStatus),
//     default: LikeStatus.None,
//   },
//   newestLikes: [LikeDetailsSchema],
// });
