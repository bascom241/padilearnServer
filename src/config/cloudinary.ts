import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();


const configureCloudinary = () => {
  const cloudName = process.env.CLOUD_NAME;
  const apiKey = process.env.CLOUD_API_KEY;
  const apiSecret = process.env.CLOUD_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUD_NAME, CLOUD_API_KEY and CLOUD_API_SECRET in server/.env",
    );
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
};

export const uploadImageBuffer = (buffer: Buffer, folder: string): Promise<string> => {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result.secure_url);
      },
    );
    uploadStream.end(buffer);
  });
};
