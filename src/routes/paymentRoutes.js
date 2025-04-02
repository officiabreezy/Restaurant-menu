const express = require('express');
const { verifyPayment} = require('../controllers/paymentController');

const router = express.Router();

router.get('/verify', verifyPayment);

module.exports = router;