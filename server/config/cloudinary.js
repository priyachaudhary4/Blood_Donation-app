const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary only if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Determine storage engine based on environment
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    // Start Cloudinary Storage
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'lifelink-profiles',
            allowed_formats: ['jpg', 'png', 'jpeg'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        }
    });
} else {
    // Fallback to Disk Storage (Local)
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
        }
    });
}

module.exports = storage;
