import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        // Check if file exists before uploading
        if (!fs.existsSync(localFilePath)) {
            return null;
        }

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image"
        });

        // Remove file from server after upload
        fs.unlinkSync(localFilePath);

        // Return the secure URL (HTTPS) - this is what you should use
        return response.secure_url || response.url;

    } catch (error) {
        // Remove file from server if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary }