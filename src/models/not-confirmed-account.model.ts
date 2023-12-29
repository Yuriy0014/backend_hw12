import { Schema, model } from 'mongoose';
import { NotConfirmedAccountDBModel } from '../types';

export const NotConfirmedAccountSchema = new Schema<NotConfirmedAccountDBModel>(
  {
    email: {
      type: String,
      required: true,
      validate: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    confirmationCode: {
      type: String,
      required: true,
    },
    expiryDate: { type: Date, required: true },
    isConfirmed: { type: Boolean, default: false },
  },
  { versionKey: false }
);

export const NotConfirmedAccountModel = model<NotConfirmedAccountDBModel>(
  'not-confirmed-accounts',
  NotConfirmedAccountSchema
);
