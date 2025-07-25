import mongoose from 'mongoose';
import Character from '../models/Character.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const fixOfficialCharacters = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all official characters
    const characters = await Character.find({ isOfficial: true });
    console.log(`Found ${characters.length} official characters`);

    for (const character of characters) {
      console.log(`\n🔧 Fixing character: ${character.name}`);
      
      // Regenerate system prompt
      character.systemPrompt = character.generateSystemPrompt();
      
      // Ensure all required fields are present
      if (!character.description) {
        console.log(`⚠️  Missing description for ${character.name}`);
      }
      if (!character.personality) {
        console.log(`⚠️  Missing personality for ${character.name}`);
      }
      if (!character.systemPrompt) {
        console.log(`⚠️  Failed to generate systemPrompt for ${character.name}`);
      }
      
      await character.save();
      console.log(`✅ Updated ${character.name} - systemPrompt length: ${character.systemPrompt?.length || 0}`);
      console.log(`   Description: ${character.description?.substring(0, 50)}...`);
    }

    console.log('\n🎉 All official characters have been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing characters:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
};

// Run the fix
fixOfficialCharacters();
