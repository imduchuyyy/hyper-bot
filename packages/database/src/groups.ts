import mongoose from "mongoose";

export interface IGroup {
  groupId: string;
  address: string;
}

export const Groups = mongoose.models.Group ?? mongoose.model<IGroup>("Group", new mongoose.Schema({
  groupId: String,
  address: String,
}));