import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get all conversations for a user with last message info
router.get('/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.params.userId,
    }).lean();

    // Get last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the last message for this conversation
        const lastMessage = await Message.findOne({
          conversationId: conversation._id.toString()
        })
        .sort({ createdAt: -1 })
        .lean();

        let lastMessageWithSender = null;
        
        if (lastMessage) {
          // Get sender information (now using string ID)
          const sender = await User.findById(lastMessage.senderId).lean();
          
          lastMessageWithSender = {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            senderName: sender ? sender.name : lastMessage.senderId, // Fallback to senderId
            createdAt: lastMessage.createdAt
          };
        }

        return {
          ...conversation,
          lastMessage: lastMessageWithSender
        };
      })
    );

    // Sort conversations by last message time (most recent first)
    conversationsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
    });

    res.json(conversationsWithLastMessage);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a conversation
router.post('/', async (req, res) => {
  try {
    const { participants } = req.body;
    const conversation = await Conversation.create({ participants });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;