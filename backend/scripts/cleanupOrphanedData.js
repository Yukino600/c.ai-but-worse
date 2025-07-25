import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import connectDB from '../config/db.js';

const cleanupOrphanedData = async () => {
  await connectDB();
  
  console.log('🧹 Starting cleanup of orphaned conversations and messages...');
  
  // Get all valid user and character IDs
  const validUserIds = (await User.find({}, '_id')).map(u => u._id.toString());
  const validCharacterIds = (await Character.find({}, '_id')).map(c => c._id.toString());
  const allValidIds = [...validUserIds, ...validCharacterIds];
  
  console.log(`📊 Found ${validUserIds.length} valid users and ${validCharacterIds.length} valid characters`);
  
  // Find conversations with invalid participants
  const conversations = await Conversation.find({});
  const conversationsToDelete = [];
  
  for (const conv of conversations) {
    const hasInvalidParticipant = conv.participants.some(p => !allValidIds.includes(p.toString()));
    if (hasInvalidParticipant) {
      conversationsToDelete.push(conv._id);
      console.log(`🗑️ Marking conversation ${conv._id} for deletion (invalid participants)`);
    }
  }
  
  // Delete orphaned conversations
  if (conversationsToDelete.length > 0) {
    await Conversation.deleteMany({ _id: { $in: conversationsToDelete } });
    console.log(`✅ Deleted ${conversationsToDelete.length} orphaned conversations`);
    
    // Delete messages from those conversations
    const deletedMessages = await Message.deleteMany({ conversationId: { $in: conversationsToDelete } });
    console.log(`✅ Deleted ${deletedMessages.deletedCount} orphaned messages`);
  }
  
  // Find and delete messages with invalid sender IDs
  const messages = await Message.find({});
  const messagesToDelete = [];
  
  for (const msg of messages) {
    if (msg.senderId && !allValidIds.includes(msg.senderId.toString())) {
      messagesToDelete.push(msg._id);
    }
  }
  
  if (messagesToDelete.length > 0) {
    await Message.deleteMany({ _id: { $in: messagesToDelete } });
    console.log(`✅ Deleted ${messagesToDelete.length} messages with invalid senders`);
  }
  
  console.log('🎉 Cleanup completed!');
  process.exit(0);
};

cleanupOrphanedData();
