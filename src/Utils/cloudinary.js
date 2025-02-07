import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { response } from "express";
import fs from "fs";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, folder) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folder || "",
      resource_type: "auto",
    });
    

    // Safely delete the file
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message);
    throw new Error("File upload to Cloudinary failed");
  }
};

export default uploadOnCloudinary