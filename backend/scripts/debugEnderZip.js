import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Character from '../models/Character.js';

// Load environment variables
dotenv.config();

const debugEnderZip = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get EnderZip character
    const enderZipChar = await Character.findOne({ name: 'EnderZip' });
    console.log('📝 EnderZip Character full systemPrompt:');
    console.log(enderZipChar.systemPrompt);
    console.log('📝 Length:', enderZipChar.systemPrompt?.length);

    // Try to update manually
    console.log('🔧 Attempting manual update...');
    const enderZipUser = await User.findOne({ username: 'EnderZip' });
    console.log('📝 Found EnderZip User:', !!enderZipUser);
    
    if (enderZipUser) {
      enderZipUser.systemPrompt = enderZipChar.systemPrompt;
      await enderZipUser.save();
      console.log('✅ Saved EnderZip User with systemPrompt');
      
      // Verify
      const updated = await User.findOne({ username: 'EnderZip' });
      console.log('📝 Verification - systemPrompt present:', !!updated.systemPrompt);
      console.log('📝 Verification - systemPrompt length:', updated.systemPrompt?.length);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

debugEnderZip();
