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

const deleteMenu = async (req, res) => {
    const { id } = req.params;

    try {
        const menu = await prisma.menu.findUnique({ where: {id} });

        if(!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        if(menu.image) {
            const imagePublicId = menu.image.split('/').pop().split('/')[0];
            await cloudinary.uploader.destroy(imagePublicId);
        }

        await prisma.menu.delete({ where: { id } });

        return res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'error deleting menu' }); 
    }
};

const updateMenu = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category } = req.body;

    try {
        const menu = await prisma.menu.findUnique({ where: { id }});

        if(!menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        let imageUrl = menu.imageUrl;
        let imagePublicId = menu.imagePublicId;

        if(req.file) {
            if(imagePublicId) {
                await cloudinary.uploader.destroy(imagePublicId);
            }

        const uploadResult = await streamUpload(req.file.buffer)
         
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        const updatedMenu = await prisma.menu.update({
            where: {id},
            data: {
                name: name || menu.name,
                description: description || menu.description,
                price: parseFloat(price)|| menu.price,
                category: category || menu.category,
                image: imageUrl || menu.image,
                imagePublicId,
            },
        });

        return res.status(200).json({ message: 'Menu updated successfully', updatedMenu });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating menu' });
        
    }
};

const getMenu = async (req, res) => {
    const { name,category, minPrice, maxPrice, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    try {
        const filters = {};

        if(name) {
            filters.name = { 
                contains: name,
                mode: 'insensitive',
            };
        }

        if(category) {
            filters.category = category;
        }

        if(minPrice || maxPrice) {
            filters.price ={};
            if(minPrice) 
                filters.price.gte = parseFloat(minPrice);
            if(maxPrice)
                filters.price.lte = parseFloat(maxPrice);
        }

        const menus = await prisma.menu.findMany({
            where: filters,
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            orderBy: { name: 'asc'}
        });

        const totalItems = await prisma.menu.count({ where: filters});
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({ 
            page:  (page),
            limit: (limit),
            totalItems,
            totalPages,
            data: menus,
        });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error fetching menus' });
    }
};

module.exports = { createMenu, deleteMenu, updateMenu, getMenu};
