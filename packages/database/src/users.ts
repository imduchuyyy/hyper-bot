import mongoose, { Schema, Document } from "mongoose";

export interface IAddress {
  address: string;
  verified: boolean;
}

export interface IUser extends Document {
  chatId: string;
  userName: string;
  avatar: string;
  addresses: IAddress[];
}

const AddressSchema = new Schema<IAddress>({
  address: { type: String, required: true },
  verified: { type: Boolean, required: true },
});

const UserSchema = new Schema<IUser>({
  chatId: { type: String, required: true },
  userName: { type: String, required: true },
  avatar: { type: String, required: true },
  addresses: { type: [AddressSchema], required: true },
});

export const Users = mongoose.model<IUser>("User", UserSchema);
