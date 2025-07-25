import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Load environment variables
dotenv.config();

const testAIMessage = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user (Madridsta)
    const user = await User.findOne({ username: 'Madridsta' });
    if (!user) {
      console.log('❌ User "Madridsta" not found');
      return;
    }
    console.log('✅ Found user:', user.username);

    // Find Itsuki AI user
    const itsuki = await User.findOne({ username: 'Itsuki_Nakano' });
    if (!itsuki) {
      console.log('❌ Itsuki AI user not found');
      return;
    }
    console.log('✅ Found Itsuki AI user:', itsuki.username);

    // Find or create conversation between user and Itsuki
    let conversation = await Conversation.findOne({
      participants: { $all: [user._id, itsuki._id] },
      isGroup: false
    });

    if (!conversation) {
      console.log('📝 Creating new conversation...');
      conversation = new Conversation({
        participants: [user._id, itsuki._id],
        isGroup: false,
        createdBy: user._id
      });
      await conversation.save();
      console.log('✅ Created conversation:', conversation._id);
    } else {
      console.log('✅ Found existing conversation:', conversation._id);
    }

    // Check recent messages
    const recentMessages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(5);

    console.log('📝 Recent messages count:', recentMessages.length);
    recentMessages.forEach((msg, index) => {
      console.log(`  ${index + 1}. Sender: ${msg.senderId}, Content: ${msg.content.substring(0, 50)}...`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

testAIMessage();
