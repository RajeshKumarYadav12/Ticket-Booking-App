const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  // If already connected, return
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    // Set mongoose options
    mongoose.set("strictQuery", false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Don't exit process in serverless environment
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    } else {
      throw error; // Let Vercel handle the error
    }
  }
};

module.exports = connectDB;
