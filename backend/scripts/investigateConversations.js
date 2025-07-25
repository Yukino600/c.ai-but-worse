import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Character from '../models/Character.js';

// Connect to MongoDB
await mongoose.connect('mongodb+srv://ganyu:66667777@cluster0.fdbg8fo.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0');

console.log('🔧 Fixing conversations...');

try {
  // Find all conversations
  const conversations = await Conversation.find({});
  
  console.log(`Found ${conversations.length} conversations to check`);
  
  for (let conv of conversations) {
    console.log(`\nChecking conversation ${conv._id}:`);
    console.log(`  Participants: ${conv.participants.length} - ${conv.participants.map(p => p.toString())}`);
    
    // If conversation has only 1 participant, it needs to be fixed
    if (conv.participants.length === 1) {
      const userId = conv.participants[0];
      console.log(`  ⚠️ Conversation has only 1 participant: ${userId}`);
      
      // Check if this is an AI conversation by looking at the createdBy and participants
      // The missing participant should be the AI character
      
      // For now, let's populate the conversation to see who it should be with
      const populatedConv = await Conversation.findById(conv._id).populate('participants', 'name username');
      console.log(`  Populated participants:`, populatedConv.participants.map(p => ({ name: p.name, username: p.username, id: p._id.toString() })));
      
      // Skip fixing for now, just log what we found
      console.log(`  → Needs manual investigation`);
    } else {
      console.log(`  ✅ Conversation looks normal`);
    }
  }
  
  console.log('\n📊 Summary complete. Found conversations that need investigation.');
} catch (error) {
  console.error('❌ Error:', error);
}

await mongoose.disconnect();
