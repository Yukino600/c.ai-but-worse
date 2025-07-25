import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const checkUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('username name email avatar');
    
    console.log('📝 All users in database:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. Username: ${user.username}, Name: ${user.name}, Email: ${user.email || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

checkUsers();
