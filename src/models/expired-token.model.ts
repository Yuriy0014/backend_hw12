import { Schema, model } from 'mongoose';
import { ExpiredTokenDBModel } from '../types';

export const ExpiredTokenSchema = new Schema<ExpiredTokenDBModel>(
  {
    token: { type: String, required: true },
  },
  { versionKey: false }
);

export const ExpiredTokenModel = model<ExpiredTokenDBModel>(
  'expired-tokens',
  ExpiredTokenSchema
);
