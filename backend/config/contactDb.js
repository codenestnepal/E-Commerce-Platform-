const mongoose = require('mongoose');

const connectContactDB = async () => {
    try {
        
        if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
            console.log('Contact features initialized using primary MongoDB connection.');
            return;
        }

        if (process.env.CONTACT_MONGO_URI) {
            await mongoose.connect(process.env.CONTACT_MONGO_URI);
            console.log('Contact MongoDB connected successfully.');
        }
    } catch (error) {
        console.warn('Contact DB Notice:', error.message);
    }
};

module.exports = connectContactDB;