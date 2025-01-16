import mongoose from "mongoose";

export interface IGroup {
  chatId: string;
  tokenAddress: string;
}

export const Groups = mongoose.model<IGroup>("Group", new mongoose.Schema({
  chatId: String,
  tokenAddress: String
}));