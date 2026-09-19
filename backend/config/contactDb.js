const mongoose = require('mongoose');

const connectContactDB = async () => {
  try {
    const uri = process.env.CONTACT_MONGO_URI || process.env.MONGO_URI;
    if (!uri) {
      console.warn('No URI found for Contact MongoDB');
      return;
    }
    const connection = await mongoose.connect(uri);
    console.log(`Contact MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Contact DB Error: ${error.message}`);
    console.warn('Server will continue running without Contact DB.');
  }
};
module.exports = connectContactDB;