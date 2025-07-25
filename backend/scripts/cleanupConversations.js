import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Character from '../models/Character.js';

// Connect to MongoDB
await mongoose.connect('mongodb+srv://ganyu:66667777@cluster0.fdbg8fo.mongodb.net/project3?retryWrites=true&w=majority&appName=Cluster0');

console.log('🧹 Cleaning up conversations...');

try {
  // Find all conversations that might have the wrong EnderZip ID
  const conversations = await Conversation.find({}).populate('participants', 'name username');
  
  console.log(`Found ${conversations.length} conversations total`);
  
  for (let conv of conversations) {
    const participantNames = conv.participants.map(p => p.name || p.username || 'Unknown');
    console.log(`Conversation ${conv._id}: [${participantNames.join(', ')}]`);
    
    // Check if this conversation has the User "EnderZip" instead of Character "EnderZip"
    const hasUserEnderZip = conv.participants.some(p => 
      (p.name === 'EnderZip' || p.username === 'EnderZip') && 
      p._id.toString() === '6881dc180046362c8e346e7a'
    );
    
    if (hasUserEnderZip) {
      console.log(`🗑️ Deleting conversation ${conv._id} with User EnderZip`);
      
      // Delete all messages in this conversation
      const deletedMessages = await Message.deleteMany({ conversationId: conv._id });
      console.log(`   Deleted ${deletedMessages.deletedCount} messages`);
      
      // Delete the conversation
      await Conversation.findByIdAndDelete(conv._id);
      console.log(`   Deleted conversation`);
    }
  }
  
  console.log('✅ Cleanup complete!');
} catch (error) {
  console.error('❌ Error during cleanup:', error);
}

await mongoose.disconnect();
