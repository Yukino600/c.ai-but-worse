import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Character from '../models/Character.js';

// Load environment variables
dotenv.config();

const checkEnderZip = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check EnderZip in User collection
    const enderZipUser = await User.findOne({ username: 'EnderZip' });
    if (enderZipUser) {
      console.log('✅ EnderZip User found:');
      console.log('  - ID:', enderZipUser._id);
      console.log('  - Username:', enderZipUser.username);
      console.log('  - Name:', enderZipUser.name);
      console.log('  - systemPrompt:', enderZipUser.systemPrompt ? 'Present' : 'Missing');
      console.log('  - systemPrompt length:', enderZipUser.systemPrompt?.length || 0);
    } else {
      console.log('❌ EnderZip User not found');
    }

    // Check EnderZip in Character collection
    const enderZipChar = await Character.findOne({ name: 'EnderZip' });
    if (enderZipChar) {
      console.log('✅ EnderZip Character found:');
      console.log('  - ID:', enderZipChar._id);
      console.log('  - Name:', enderZipChar.name);
      console.log('  - Description:', enderZipChar.description);
      console.log('  - Personality:', enderZipChar.personality);
      console.log('  - systemPrompt:', enderZipChar.systemPrompt ? 'Present' : 'Missing');
      console.log('  - systemPrompt length:', enderZipChar.systemPrompt?.length || 0);
    } else {
      console.log('❌ EnderZip Character not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

checkEnderZip();
