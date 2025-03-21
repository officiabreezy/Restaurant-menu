const express =  require('express');
const {createRestaurant, getRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant } = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/createRestaurant', authMiddleware, createRestaurant);
router.get('/get', getRestaurants);
router.get('/get/:id', getRestaurantById);
router.put('/update/:id', authMiddleware, updateRestaurant);
router.delete('/delete/:id', authMiddleware, deleteRestaurant);

module.exports = router;