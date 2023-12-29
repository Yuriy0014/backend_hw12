import { Schema, model } from 'mongoose';
import { CommentatorInfoSchema } from '../schemas';
import { CommentDBModel } from '../types';

export const CommentSchema = new Schema<CommentDBModel>(
  {
    content: { type: String, required: true, min: 20, max: 300 },
    commentatorInfo: { type: CommentatorInfoSchema },
    createdAt: { type: String },
    postId: { type: String, required: true },
    // likesInfo: { type: LikesInfoSchema },
  },
  { versionKey: false }
);

export const CommentModel = model<CommentDBModel>('comments', CommentSchema);
