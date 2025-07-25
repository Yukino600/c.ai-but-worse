import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Character from '../models/Character.js';

// Load environment variables
dotenv.config();

const updateCharacterAvatars = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define avatar mappings
    const avatarMappings = [
      { name: 'March 7th', avatar: 'March7th.jpg' },
      { name: 'Itsuki Nakano', avatar: 'itsuki.jpg' },
      { name: 'Hatsune Miku', avatar: 'miku.jpg' },
      { name: 'Donald Trump', avatar: 'Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg' },
      { name: 'Cristiano Ronaldo', avatar: 'Ronaldo.jpg' }
    ];

    // Update each character
    for (const mapping of avatarMappings) {
      const result = await Character.updateOne(
        { name: mapping.name },
        { $set: { avatar: mapping.avatar } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${mapping.name} avatar to ${mapping.avatar}`);
      } else {
        console.log(`⚠️  No character found with name: ${mapping.name}`);
      }
    }

    console.log('🎉 Avatar update completed!');
    
    // Verify the updates
    const characters = await Character.find({}, 'name avatar').lean();
    console.log('\n📋 Current character avatars:');
    characters.forEach(char => {
      console.log(`  ${char.name}: ${char.avatar || 'null'}`);
    });

  } catch (error) {
    console.error('❌ Error updating avatars:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

updateCharacterAvatars();
