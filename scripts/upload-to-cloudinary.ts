// scripts/upload-to-cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { glob } from "glob";
import path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with TypeScript type safety
cloudinary.config({
  cloud_name: process.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.PUBLIC_CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

async function uploadImages() {
  // Use promisified glob
  const images = await glob("public/images/**/*.*");

  for (const imagePath of images) {
    const publicId = path.basename(imagePath, path.extname(imagePath));

    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        public_id: publicId,
        folder: "acetone",
        use_filename: true,
        unique_filename: false,
      });
      console.log(`Uploaded ${publicId}: ${result.secure_url}`);
    } catch (error) {
      console.error(`Failed to upload ${publicId}:`, error);
    }
  }
}

uploadImages().catch(console.error);
