import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Connect to MongoDB using the MONGO_URI from your .env
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1); // Stop the app if we can't connect
  }
};

export default connectDB;
