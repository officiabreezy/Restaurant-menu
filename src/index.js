const dotenv = require('dotenv').config();
const express = require('express');
const multer = require('multer');
// const fileupload = require('express-fileupload');
const authRoute = require('./routes/authRoute');
const restaurantRoute = require('./routes/restaurantRoute');
const menuRoute = require('./routes/menuRoute');
const app = express();

const Port = process.env.PORT || 5050

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage});
app.use(express.json());
// app.use(fileupload({ useTempFiles: true }));

app.use('/api/user', authRoute);
app.use('/api/restaurant', restaurantRoute);
app.use('/api/menu', menuRoute);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// app.post("/upload-image", upload.single('image'), async (req, res) => {
//     const data = { image: req.body.image };

//     cloudinary.uploader.upload(data.image)
//         .then((result) => {
//             res.status(200).send({
//                 message: "Upload successful",
//                 result,
//             });
//         })
//         .catch((error) => {
//             res.status(500).send({
//                 message: "Upload failed",
//                 error,
//             });
//         });
// });

app.listen(Port, () => {
    console.log(`Server is running on port ${Port}`);
});