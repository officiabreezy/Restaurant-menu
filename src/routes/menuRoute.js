const express = require('express');
const {createMenu, deleteMenu,updateMenu,getMenu } = require('../controllers/menuController');
// const {upload}= require('../config/cloudinary');
const upload = require('../config/multer');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router(); 


router.post('/createMenu',upload.single('image'), createMenu);
router.get('/getMenu',getMenu);
router.delete('/deleteMenu/:id',deleteMenu);
router.put('/updateMenu/:id',upload.single('image'), updateMenu);

module.exports = router;