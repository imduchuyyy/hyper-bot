import { DATABASE_URI } from "@hyper-bot/config";
import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(`${DATABASE_URI}`);
    console.log("Connected to database")
  } catch (error) {
    console.log("Error connecting to database: ", error)
  }
};

export * from "./groups"
export * from "./users"
export * from "./requests"
export * from "./joined"