import Character from '../models/Character.js';
import connectDB from '../config/db.js';

async function checkCharacters() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    const chars = await Character.find({});
    console.log('All characters:');
    chars.forEach(char => {
      console.log(`- ${char.name}: isPublic=${char.isPublic}, isOfficial=${char.isOfficial}`);
    });

    // Update characters to be public if they're not
    const updateResult = await Character.updateMany(
      { isOfficial: true },
      { $set: { isPublic: true } }
    );
    
    console.log(`\n🔧 Updated ${updateResult.modifiedCount} official characters to be public`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCharacters();
