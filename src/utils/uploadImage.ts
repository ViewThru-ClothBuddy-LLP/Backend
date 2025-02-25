import { v2 as cloudinary } from "cloudinary";
import { Request } from "express";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer Storage Configuration for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => ({
    folder: "reviews",
    resource_type: "image",
    public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
  }),
});

// Multer Upload Middleware
const upload = multer({ storage });

// Function to Manually Upload Image (If Not Using Multer Middleware)
export const uploadImage = async (file: Express.Multer.File): Promise<string | undefined> => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "reviews",
      resource_type: "image", // Accepts JPEG, JPG, PNG, GIF, etc.
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return undefined;
  }
};

export default upload;
