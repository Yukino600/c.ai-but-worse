import User from '../models/User.js';
import Character from '../models/Character.js';
import connectDB from '../config/db.js';

const checkUsernames = async () => {
  await connectDB();
  
  console.log('=== USER COLLECTION (Official Characters) ===');
  const users = await User.find({}, 'username name').sort({ username: 1 });
  users.forEach(user => console.log(`- ${user.username} (${user.name})`));
  
  console.log('\n=== CHARACTER COLLECTION (User-Created) ===');
  const chars = await Character.find({}, 'name isOfficial').sort({ name: 1 });
  chars.forEach(char => console.log(`- ${char.name} (isOfficial: ${char.isOfficial})`));
  
  process.exit(0);
};

checkUsernames();
