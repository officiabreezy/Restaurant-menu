const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary environment variables. Check your .env file.");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Cloudinary initialized:", cloudinary.config());

const testCloudinaryConnection = async () => {
    try {
        const response = await cloudinary.api.ping();
        console.log("Cloudinary is connected:", response);
    } catch (error) {
        console.error("Cloudinary connection error:", error);
    }
};

testCloudinaryConnection();

module.exports = {cloudinary };

