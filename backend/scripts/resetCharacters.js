import mongoose from 'mongoose';
import Character from '../models/Character.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

async function resetCharacters() {
  try {
    await connectDB();

    // Delete all existing characters
    const deleteResult = await Character.deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing characters`);

    // Delete admin user too to start fresh
    await User.deleteMany({ username: 'admin' });
    console.log('🗑️ Deleted admin user');

    console.log('✅ Database cleared, ready for fresh initialization');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetCharacters();
