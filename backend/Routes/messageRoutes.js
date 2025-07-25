import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send a message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user._id.toString();

    if (!conversationId || !content) {
      return res.status(400).json({ 
        error: 'Conversation ID and content are required' 
      });
    }

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId
    });

    if (!conversation) {
      return res.status(403).json({ 
        error: 'You are not a participant in this conversation' 
      });
    }

    const message = await Message.create({ 
      conversationId, 
      senderId, 
      content 
    });

    // Populate sender info for the response
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name username avatar')
      .lean();

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get messages in a conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    // Verify user is part of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ 
        error: 'You are not a participant in this conversation' 
      });
    }

    const messages = await Message.find({ 
      conversationId: conversationId 
    })
    .sort({ createdAt: 1 })
    .lean();

    // Manually populate senderId from both User and Character collections
    for (let message of messages) {
      if (message.senderId) {
        // Try to find in User collection first
        let sender = await User.findById(message.senderId, 'name username avatar').lean();
        
        // If not found in User collection, try Character collection
        if (!sender) {
          sender = await Character.findById(message.senderId, 'name avatar').lean();
          if (sender) {
            // For characters, create a username from the name
            sender.username = sender.name?.replace(/\s+/g, '_');
          }
        }
        
        message.senderId = sender || { 
          _id: message.senderId, 
          name: 'Unknown User', 
          username: 'unknown',
          avatar: null 
        };
      }
    }

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id.toString();

    const message = await Message.findOne({
      _id: messageId,
      senderId: userId
    });

    if (!message) {
      return res.status(404).json({ 
        error: 'Message not found or you do not have permission to delete it' 
      });
    }

    await Message.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted successfully' });

  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;