import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all conversations for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    const conversations = await Conversation.find({
      participants: userId,
    }).lean();

    // Get last message for each conversation and participant info
    const conversationsWithLastMessage = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the last message for this conversation
        const lastMessage = await Message.findOne({
          conversationId: conversation._id.toString()
        })
        .sort({ createdAt: -1 })
        .lean();

        // Get participant details from both User and Character collections
        const participantUsers = await User.find({
          _id: { $in: conversation.participants }
        }).select('name username avatar isOnline').lean();

        const participantCharacters = await Character.find({
          _id: { $in: conversation.participants }
        }).select('name avatar').lean();

        // Combine all participants
        const allParticipants = [
          ...participantUsers,
          ...participantCharacters.map(char => ({
            ...char,
            username: char.name?.replace(/\s+/g, '_'),
            isOnline: false // Characters are always "offline"
          }))
        ];

        // Create participant names array excluding current user
        const participantNames = allParticipants
          .filter(participant => participant._id.toString() !== userId)
          .map(participant => participant.name || participant.username);

        let lastMessageWithSender = null;
        
        if (lastMessage) {
          const sender = allParticipants.find(participant => 
            participant._id.toString() === lastMessage.senderId.toString()
          );
          
          lastMessageWithSender = {
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            senderName: sender ? (sender.name || sender.username) : 'Unknown User',
            createdAt: lastMessage.createdAt
          };
        }

        return {
          ...conversation,
          participants: participantNames.length > 0 ? participantNames : ['Unknown User'],
          participantUsers: allParticipants.filter(participant => participant._id.toString() !== userId),
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
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { participants } = req.body;
    const currentUserId = req.user._id.toString();

    if (!participants || !Array.isArray(participants)) {
      return res.status(400).json({ error: 'Participants array is required' });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([currentUserId, ...participants])];

    // Check if conversation already exists with same participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: allParticipants, $size: allParticipants.length }
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Verify all participants exist
    const validUsers = await User.find({
      _id: { $in: allParticipants }
    });

    if (validUsers.length !== allParticipants.length) {
      return res.status(400).json({ error: 'One or more participants not found' });
    }

    const conversation = await Conversation.create({ 
      participants: allParticipants,
      createdBy: currentUserId
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get conversation by ID
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).lean();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Get participant details
    const participantUsers = await User.find({
      _id: { $in: conversation.participants }
    }).select('name username avatar isOnline').lean();

    res.json({
      ...conversation,
      participantUsers
    });

  } catch (err) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;