import { Schema, model } from 'mongoose';
import { UserDBModel } from '../types';

export const UserSchema = new Schema<UserDBModel>(
  {
    email: {
      type: String,
      required: true,
      validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    accountData: {
      login: {
        type: String,
        required: true,
        min: 3,
        max: 10,
        validate: /^[a-zA-Z0-9_-]*$/,
      },
      password: { type: String, required: true, min: 6, max: 20 },
      createdAt: { type: String },
    },
  },
  { versionKey: false }
);

export const UserModel = model<UserDBModel>('users', UserSchema);
