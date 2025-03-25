require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('DB Connected');
}).catch((err) => {
    console.log('DB Connection Error', err);
    process.exit(1); // Exit if DB connection fails
});

// Add graceful error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});