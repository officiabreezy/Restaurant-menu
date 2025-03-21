const prisma = require('../config/db');

const createRestaurant = async (req, res) => {
    const { name }= req.body;

 try {
    const existingRestaurant = await prisma.restaurant.findFirst({
        where: { name: name, ownerId: req.user.userId },
    });
    if(existingRestaurant){
        res.status(400).json({ error: 'restaurant already exists' });
    }

    const restaurant = await prisma.restaurant.create({
        data: { name, ownerId:req.user.userId },
    })
    res.status(201).json({message: 'restaurant created successfully', restaurant})
 } catch (error) {
    console.error(error);
    res.status(500).json({ error:'error creating restaurant'})
 }
};

const getRestaurants = async (req, res) => {
    try {
    const restaurants = await prisma.restaurant.findMany();
    res.status(200).json(restaurants);
} catch (error) {
    res.status(500).json({ error: 'error fetching restaurants' });
 }
};

const getRestaurantById = async (req, res) => {
    const {id} = req.params;
    console.log('received id: ', id);
    
    if (!id) {
        return res.status(400).json({ error: 'invalid restaurant id' });
    }
    try {

        const restaurant = await prisma.restaurant.findUnique({ where : { id: String(id)} });
        if(!restaurant) {
            console.log("Restaurant not found for ID:", id);
            return res.status(404).json({ error: 'restaurant not found'});
        }
        return res.status(200).json(restaurant);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'error fetching restaurant' });
    }
};

const updateRestaurant = async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: String(id) },
        });
        if(!restaurant) {
            res.status(404).json({ error: 'restaurant not found'});
        }

        const updatedRestaurant = await prisma.restaurant.update({
            where: { id: String(id) },
            data: { name},
        });    
        res.status(200).json({message:'Restaurant updated successfully', updatedRestaurant});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'error updating restaurant' });
    }
 };

const deleteRestaurant = async (req, res) => {
    const {id} = req.params;
    try {
        const restaurant = await prisma.restaurant.findUnique({ where : { id: String(id) } });
    if(!restaurant) {
        res.status(404).json({ error: 'restaurant not found'});
    }
       await prisma.restaurant.delete({where: { id: String(id) } });

       res.status(201).json({ messaage: 'Restaurant deleted successful' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'error deleting restaurant' });
    }
};

module.exports = {createRestaurant, getRestaurants, deleteRestaurant, updateRestaurant, getRestaurantById}