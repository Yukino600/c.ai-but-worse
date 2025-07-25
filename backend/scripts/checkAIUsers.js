import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const checkAIUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find AI users
    const aiUsernames = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'];
    
    for (const username of aiUsernames) {
      const user = await User.findOne({ username }).select('username name avatar');
      
      if (user) {
        console.log(`✅ ${username}: name="${user.name}", avatar="${user.avatar}"`);
      } else {
        console.log(`❌ ${username}: NOT FOUND`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking AI users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

checkAIUsers();
