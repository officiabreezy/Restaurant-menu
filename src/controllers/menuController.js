const prisma = require('../config/db');
const {cloudinary} = require('../config/cloudinary');

const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const createMenu = async (req, res) => {
    console.log("Received request:", req.body);
    console.log("Uploaded file:", req.file);

    // if (!cloudinary || !cloudinary.uploader) {
    //     return res.status(500).json({ error: "Cloudinary is not properly initialized." });
    // }

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded. Ensure you're sending a file." });
    }

    const { name, description, price, category, restaurantId } = req.body;

    try {
        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        console.log("Before uploading to Cloudinary");

        // Upload image using buffer
        const result = await streamUpload(req.file.buffer);

        console.log("After uploading to Cloudinary");
        console.log("Cloudinary Upload Result:", result);

        if (!result || !result.secure_url) {
            console.error("Upload failed, no URL returned.");
            return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }

        const imageUrl = result.secure_url;
        console.log("Image URL to be saved:", imageUrl);

        // Save menu to database
        const menu = await prisma.menu.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                image: imageUrl,
                restaurantId,
            },
        });

        return res.status(201).json({ message: 'Menu created successfully', menu });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error creating menu' });
    }
};

module.exports = { createMenu };
