import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Character from '../models/Character.js';

// Load environment variables
dotenv.config();

const fixEnderZipSystemPrompt = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get EnderZip character with systemPrompt
    const enderZipChar = await Character.findOne({ name: 'EnderZip' });
    if (!enderZipChar || !enderZipChar.systemPrompt) {
      console.log('❌ EnderZip Character or systemPrompt not found');
      return;
    }

    console.log('📝 Found EnderZip Character systemPrompt:', enderZipChar.systemPrompt.substring(0, 100) + '...');

    // Update EnderZip user with the systemPrompt
    const result = await User.findOneAndUpdate(
      { username: 'EnderZip' },
      { systemPrompt: enderZipChar.systemPrompt },
      { new: true }
    );

    if (result) {
      console.log('✅ Updated EnderZip User with systemPrompt');
      console.log('📝 SystemPrompt length:', result.systemPrompt.length);
    } else {
      console.log('❌ Failed to update EnderZip User');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

fixEnderZipSystemPrompt();
