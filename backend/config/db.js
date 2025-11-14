import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Try to connect to the database using the address from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If successful, log it to the console
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If it fails, log the error and stop the server
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;