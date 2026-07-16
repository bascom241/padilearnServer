import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connecToDB = async ():Promise<void>=> {
  try {
    const url = process.env.MONGO_URL;
    

    if (!url) {
      throw new Error("MONGO_URL not found in environment variables");
    }

    await mongoose.connect(url);

    console.log("✅ MongoDB connected successfully");
  } catch (error:any) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // stop app if DB fails
  }
};
