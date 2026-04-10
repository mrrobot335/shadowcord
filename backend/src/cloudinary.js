const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shadowcord/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 256, height: 256, crop: 'fill' }]
  }
});

// Storage for server icons
const serverIconStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'shadowcord/servers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 256, height: 256, crop: 'fill' }]
  }
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadServerIcon = multer({ storage: serverIconStorage });

module.exports = { uploadAvatar, uploadServerIcon };