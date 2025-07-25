import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// POST: user sends a message
router.post('/', async (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content) {
    return res.status(400).json({ error: 'userId and content are required' });
  }

  try {
    // 🔥 (Mock AI reply for now)
    const aiReply = `Echo: ${content}`;

    // Save to MongoDB
    const message = await Message.create({
      userId,
      content,
      aiMessage: aiReply,
    });

    res.json({ reply: message.aiMessage, message });
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: get chat history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
