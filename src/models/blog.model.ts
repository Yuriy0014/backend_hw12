import { Schema, model } from 'mongoose';
import { BlogDBModel } from '../types';

export const BlogSchema = new Schema<BlogDBModel>(
  {
    name: { type: String, required: true, max: 15 },
    description: { type: String, required: true, max: 500 },
    websiteUrl: {
      type: String,
      required: true,
      max: 100,
      validate: new RegExp(
        '^https://([a-zA-Z0-9_-]+.)+[a-zA-Z0-9_-]+(/[a-zA-Z0-9_-]+)*/?$'
      ),
    },
    createdAt: { type: String },
    isMembership: { type: Boolean, default: false },
  },
  { versionKey: false }
);

export const BlogModel = model<BlogDBModel>('blogs', BlogSchema);
