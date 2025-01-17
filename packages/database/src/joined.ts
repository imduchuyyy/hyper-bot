import mongoose, { Schema, Document } from "mongoose";

export interface IJoined extends Document {
  groupId: string;
  userId: string;
}

const JoinedSchema: Schema = new Schema({
  groupId: { type: String, required: true },
  userId: { type: String, required: true },
});

export const Joined = mongoose.models.Joined ?? mongoose.model<IJoined>("Joined", JoinedSchema);
