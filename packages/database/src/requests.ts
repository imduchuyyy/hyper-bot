import mongoose, { Schema, Document } from "mongoose";

export interface IRequest extends Document {
  userId: string;
  groupId: string;
  requestId: string;
}

const RequestSchema = new Schema<IRequest>({
  userId: { type: String, required: true },
  requestId: { type: String, required: true },
});

export const Requests = mongoose.models.Request ?? mongoose.model<IRequest>("Request", RequestSchema);