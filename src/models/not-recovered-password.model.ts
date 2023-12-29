import { Schema, model } from 'mongoose';
import { NotRecoveredPasswordDBModel } from '../types';

export const NotRecoveredPasswordSchema =
  new Schema<NotRecoveredPasswordDBModel>(
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
    },
    { versionKey: false }
  );

export const NotRecoveredPasswordModel = model<NotRecoveredPasswordDBModel>(
  'not-recovered-passwords',
  NotRecoveredPasswordSchema
);
