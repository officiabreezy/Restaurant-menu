const dotenv = require('dotenv').config();
const express = require('express');
const multer = require('multer');
// const fileupload = require('express-fileupload');
const authRoute = require('./routes/authRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const menuRoute = require('./routes/menuRoute');
const paymentRoute = require('./routes/paymentRoutes');
const app = express();

const Port = process.env.PORT || 5050

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage});
app.use(express.json());
// app.use(fileupload({ useTempFiles: true }));

app.use('/api/user', authRoute);
app.use('/api/restaurant', restaurantRoute);
app.use('/api/menu', menuRoute);
app.use('/api/payment', paymentRoute);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});