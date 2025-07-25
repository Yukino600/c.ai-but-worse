import mongoose from 'mongoose';
import Character from './models/Character.js';

// Connect to MongoDB
const MONGO_URI = 'mongodb+srv://ganyu:66667777@cluster0.fdbg8fo.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0';

async function checkEnderZip() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const character = await Character.findOne({ name: /enderzip/i });
    if (character) {
      console.log('EnderZip character found:');
      console.log('Name:', character.name);
      console.log('Username:', character.username);
      console.log('Avatar:', character.avatar);
      console.log('Created By:', character.createdBy);
      console.log('Is Official:', character.isOfficial);
    } else {
      console.log('EnderZip character not found');
      const allChars = await Character.find({}).select('name username');
      console.log('All characters:', allChars);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEnderZip();
