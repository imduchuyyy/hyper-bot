import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  userName: string;
  addresses: string[];
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  addresses: { type: [String], required: false },
});

export const Users = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
