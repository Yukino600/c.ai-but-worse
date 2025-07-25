import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const updateAIUserAvatars = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define avatar mappings for AI users
    const avatarMappings = [
      { username: 'March_7th', avatar: 'March7th.jpg' },
      { username: 'Itsuki_Nakano', avatar: 'itsuki.jpg' },
      { username: 'Hatsune_Miku', avatar: 'miku.jpg' },
      { username: 'Donald_Trump', avatar: 'Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg' },
      { username: 'Cristiano_Ronaldo', avatar: 'Ronaldo.jpg' }
    ];

    // Update each AI user
    for (const mapping of avatarMappings) {
      const result = await User.updateOne(
        { username: mapping.username },
        { $set: { avatar: mapping.avatar } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${mapping.username} avatar to ${mapping.avatar}`);
      } else {
        console.log(`⚠️  No user found with username: ${mapping.username}`);
      }
    }

    console.log('🎉 AI user avatar update completed!');
    
    // Verify the updates
    const aiUsernames = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'];
    console.log('\n📋 Current AI user avatars:');
    
    for (const username of aiUsernames) {
      const user = await User.findOne({ username }).select('username name avatar');
      if (user) {
        console.log(`  ${username}: ${user.avatar}`);
      }
    }

  } catch (error) {
    console.error('❌ Error updating AI user avatars:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

updateAIUserAvatars();
