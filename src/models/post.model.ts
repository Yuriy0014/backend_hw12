import { Schema, model } from 'mongoose';
import { PostDBModel } from '../types';

export const PostSchema = new Schema<PostDBModel>(
  {
    title: { type: String, required: true, max: 30 },
    shortDescription: { type: String, required: true, max: 100 },
    content: { type: String, required: true, max: 1000 },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String },
    // extendedLikesInfo: { type: ExtendedLikesInfoSchema },
  },
  { versionKey: false }
);

export const PostModel = model<PostDBModel>('posts', PostSchema);
