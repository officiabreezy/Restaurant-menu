const express = require('express');
const {createMenu} = require('../controllers/menuController');
// const {upload}= require('../config/cloudinary');
const upload = require('../config/multer');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router(); 


router.post('/createMenu',upload.single('image'), createMenu);


module.exports = router;