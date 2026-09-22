const mongoose = require('mongoose');

let contactConnection = null;

const connectContactDB = async () => {
  try {
    const uri = process.env.CONTACT_MONGO_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('[ContactDB] No URI found. Skipping Contact MongoDB connection.');
      return;
    }
    // Use a separate mongoose connection instance (not the global one)
    contactConnection = await mongoose.createConnection(uri).asPromise();
    console.log(`[ContactDB] Connected: ${contactConnection.host}`);
  } catch (error) {
    console.error(`[ContactDB] Connection failed: ${error.message}`);
    console.warn('[ContactDB] Server will continue running without Contact DB.');
  }
};

const getContactConnection = () => contactConnection;

module.exports = { connectContactDB, getContactConnection };