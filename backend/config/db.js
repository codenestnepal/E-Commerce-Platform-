const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        console.warn('Server will continue running without DB. Check your MONGO_URI and network connection.');
        // process.exit(1); // removed so server stays alive on transient network errors
    }
}

module.exports = connectDB;