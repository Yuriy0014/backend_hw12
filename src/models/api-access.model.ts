import { Schema, model } from 'mongoose';
import { ApiAccessDBModel } from '../types';

export const ApiAccessSchema = new Schema<ApiAccessDBModel>(
  {
    ip: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { versionKey: false }
);

export const ApiAccessModel = model<ApiAccessDBModel>(
  'api-accesses',
  ApiAccessSchema
);
