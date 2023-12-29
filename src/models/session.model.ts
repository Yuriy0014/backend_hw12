import { Schema, model } from 'mongoose';
import { SessionDBModel } from '../types';

export const SessionSchema = new Schema<SessionDBModel>(
  {
    userId: { type: String, required: true },
    deviceId: { type: String, required: true },
    deviceTitle: { type: String, required: true },
    ip: { type: String, required: true },
    issueDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
  },
  { versionKey: false }
);

export const SessionModel = model<SessionDBModel>('sessions', SessionSchema);
