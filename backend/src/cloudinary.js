const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — file goes into buffer, we upload manually to Cloudinary
const storage = multer.memoryStorage();

const uploadAvatar = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadServerIcon = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Helper function to upload a buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: `shadowcord/${folder}`, transformation: [{ width: 256, height: 256, crop: 'fill' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

module.exports = { uploadAvatar, uploadServerIcon, uploadToCloudinary };