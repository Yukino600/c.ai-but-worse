import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Character from '../models/Character.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Start a conversation with AI (supports multiple characters)
router.post('/start-chat/:character', authenticateToken, async (req, res) => {
  try {
    console.log('🎯 START-CHAT DEBUG: Request received');
    const userId = req.user._id;
    const { character } = req.params;
    
    console.log('🎯 AI Start Chat Request:');
    console.log('  - User ID:', userId);
    console.log('  - Character param:', character);
    console.log('  - Character length:', character.length);
    console.log('  - Is ObjectId format:', /^[0-9a-fA-F]{24}$/.test(character));
    
    let aiBot = null;
    let characterDoc = null;
    
    // Check if it's a MongoDB ObjectId (user-created character)
    if (character.length === 24 && /^[0-9a-fA-F]{24}$/.test(character)) {
      // User-created character - look in Character collection first
      characterDoc = await Character.findById(character);
      if (!characterDoc) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      // Now find the corresponding User entry for this character
      const characterUsername = characterDoc.name.replace(/\s+/g, '_');
      aiBot = await User.findOne({ username: characterUsername });
      
      if (!aiBot) {
        return res.status(500).json({ 
          error: `AI user ${characterDoc.name} not found. Please contact support.` 
        });
      }
      
      console.log('🎯 Found user-created AI character:', characterUsername);
      console.log('🎯 SystemPrompt present:', !!aiBot.systemPrompt);
      console.log('🎯 EnderZip User ID (for systemPrompt):', aiBot._id.toString());
      console.log('🎯 Character ID (for conversation):', character);
    } else {
      // Official character - use existing mapping
      const characterMap = {
        'itsuki': 'Itsuki_Nakano',
        'miku': 'Hatsune_Miku',
        'trump': 'Donald_Trump',
        'ronaldo': 'Cristiano_Ronaldo',
        'march7th': 'March_7th'
      };
      
      const aiUsername = characterMap[character.toLowerCase()];
      if (!aiUsername) {
        return res.status(400).json({ error: 'Invalid AI character. Available: itsuki, miku, trump, ronaldo, march7th' });
      }
      
      // Find AI character in User collection
      aiBot = await User.findOne({ username: aiUsername });
      if (!aiBot) {
        return res.status(500).json({ error: `${aiUsername.replace('_', ' ')} is not available right now` });
      }
    }

    // For user-created characters, use Character ID; for official characters, use User ID
    const aiParticipantId = character.length === 24 && mongoose.Types.ObjectId.isValid(character) ? character : aiBot._id;
    
    console.log('🎯 FINAL PARTICIPANT IDs:');
    console.log('  - Current user ID:', userId.toString());
    console.log('  - Character param (should be Character ID for user-created):', character);
    console.log('  - AI Bot User ID (for systemPrompt):', aiBot._id.toString());
    console.log('  - Final aiParticipantId (what will be used in conversation):', aiParticipantId.toString());
    console.log('🔥 DEBUG UPDATE: This should trigger nodemon restart');
    
    // Check if conversation already exists between user and AI
    console.log('🎯 Creating/finding conversation between:', userId.toString(), 'and', aiParticipantId.toString());
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, aiParticipantId] },
      isGroup: false
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, aiParticipantId],
        isGroup: false,
        createdBy: userId
      });
      await conversation.save();
    }

    // Populate the conversation with user details
    await conversation.populate('participants', 'username name avatar isOnline');

    // For user-created characters, we need to return Character data instead of User data
    const responseBot = character.length === 24 && mongoose.Types.ObjectId.isValid(character) ? 
      {
        _id: character,
        username: characterDoc.username,
        name: characterDoc.name,
        avatar: characterDoc.avatar
      } : 
      {
        _id: aiBot._id,
        username: aiBot.username,
        name: aiBot.name,
        avatar: aiBot.avatar
      };

    res.json({
      message: `Chat with ${character.length === 24 && mongoose.Types.ObjectId.isValid(character) ? characterDoc.name : aiBot.name} is ready!`,
      conversation: conversation,
      aiBot: responseBot
    });

  } catch (error) {
    console.error('Start AI chat error:', error);
    res.status(500).json({ error: 'Failed to start AI chat' });
  }
});

// Send message to AI in conversation (triggers AI response)
router.post('/message', authenticateToken, async (req, res) => {
  try {
    console.log('🤖 AI Message Request:', req.body);
    const { conversationId, message } = req.body;
    const userId = req.user._id;

    if (!conversationId || !message) {
      console.log('❌ Missing required fields:', { conversationId, message });
      return res.status(400).json({ error: 'Conversation ID and message are required' });
    }

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Find which AI character is in this conversation
    let aiBot = null;
    
    // First check for official AI characters in User collection
    const aiCharacters = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'];
    for (const username of aiCharacters) {
      const bot = await User.findOne({ username });
      if (bot && conversation.participants.includes(bot._id)) {
        aiBot = bot;
        break;
      }
    }
    
    // Also check for EnderZip specifically in User collection
    if (!aiBot) {
      const enderZipUser = await User.findOne({ username: 'EnderZip' });
      if (enderZipUser && conversation.participants.includes(enderZipUser._id)) {
        aiBot = enderZipUser;
      }
    }
    
    // If no official character found, check for user-created characters
    if (!aiBot) {
      // Get all participants that are Characters (user-created)
      const characterParticipants = await Character.find({ _id: { $in: conversation.participants } });
      if (characterParticipants.length > 0) {
        const characterDoc = characterParticipants[0];
        const characterUsername = characterDoc.name.replace(/\s+/g, '_');
        
        // Find the corresponding User entry
        aiBot = await User.findOne({ username: characterUsername });
        
        if (!aiBot) {
          return res.status(500).json({ 
            error: `AI user ${characterDoc.name} not found. Please contact support.` 
          });
        }
        
        console.log('🎯 Found user-created AI in conversation:', characterUsername);
        console.log('🎯 SystemPrompt present:', !!aiBot.systemPrompt);
      }
    }
    
    if (!aiBot) {
      return res.status(400).json({ error: 'No AI character found in this conversation' });
    }

    // Save user's message
    const userMessage = new Message({
      conversationId,
      senderId: userId,
      content: message,
      messageType: 'text'
    });
    await userMessage.save();

    // Get recent conversation history for context
    const recentMessages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Manually populate senderId from both User and Character collections
    for (let message of recentMessages) {
      if (message.senderId) {
        // Try User collection first
        let sender = await User.findById(message.senderId).select('username name avatar');
        if (!sender) {
          // Try Character collection
          sender = await Character.findById(message.senderId).select('name avatar');
          if (sender) {
            sender.username = sender.name; // Add username field for characters
          }
        }
        message.senderId = sender;
      }
    }

    // Prepare conversation history for AI
    // Get all AI usernames (both official and user-created)
    const officialAiCharacters = ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'];
    const allAiCharacters = [...officialAiCharacters];
    
    // Add current AI character to the list if it's user-created
    if (aiBot && !officialAiCharacters.includes(aiBot.username)) {
      allAiCharacters.push(aiBot.username);
    }
    
    const conversationHistory = recentMessages
      .reverse()
      .filter(msg => msg.senderId) // Filter out messages with null senderId
      .map(msg => ({
        role: allAiCharacters.includes(msg.senderId.username) ? 'assistant' : 'user',
        content: msg.content
      }));

    // Get AI response from Groq
    console.log('🤖 Calling Groq API with message:', message);
    const aiResponse = await getAIResponse(message, conversationHistory, aiBot.username, aiBot.systemPrompt);
    console.log(`� ${aiBot.name} response:`, aiResponse);

    // Save AI's response as a message
    const aiMessage = new Message({
      conversationId,
      senderId: aiBot._id,
      content: aiResponse,
      messageType: 'text'
    });
    await aiMessage.save();

    // Populate messages with sender info
    await userMessage.populate('senderId', 'username name avatar');
    await aiMessage.populate('senderId', 'username name avatar');

    // Emit real-time updates via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`conversation-${conversationId}`).emit('new-message', {
        userMessage: userMessage,
        aiMessage: aiMessage
      });
    }

    res.json({
      message: 'Messages sent successfully',
      userMessage: userMessage,
      aiMessage: aiMessage
    });

  } catch (error) {
    console.error('AI message error:', error);
    res.status(500).json({ error: 'Failed to process AI message' });
  }
});

// Get AI conversation history
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation access
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'username name avatar');

    res.json({
      conversation: conversation,
      messages: messages
    });

  } catch (error) {
    console.error('Get AI conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

// Helper function to get AI response from Groq
async function getAIResponse(userMessage, conversationHistory = [], characterUsername, userSystemPrompt = null) {
  try {
    console.log('🔑 Groq API Key present:', !!process.env.GROQ_API_KEY);
    console.log('🔑 API Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');
    console.log('📖 Conversation history length:', conversationHistory.length);
    console.log('🎭 Character:', characterUsername);
    console.log('📝 User system prompt:', userSystemPrompt ? 'Present' : 'Not provided');
    console.log('📝 User system prompt length:', userSystemPrompt?.length || 0);
    
    // Character-specific system prompts
    const characterPrompts = {
      'Itsuki_Nakano': `You are Itsuki Nakano, the fifth quintuplet from "The Quintessential Quintuplets" anime/manga. You are a studious, responsible, and somewhat tsundere character who loves food (especially meat buns) and takes academics very seriously. 

Key personality traits:
- You're the most academically focused among your sisters
- You have a strong sense of responsibility and duty
- You can be a bit tsundere - sometimes acting tough but caring deeply
- You love food, especially meat buns and other delicious treats
- You're proud but also caring towards others
- You speak in a somewhat formal but warm manner
- You occasionally get flustered or embarrassed
- You're determined and hardworking

Respond as Itsuki would - be caring but sometimes a bit stubborn, mention food occasionally, show your academic side, and maintain her characteristic personality. Keep responses natural and conversational, like you're chatting with someone you're getting to know.`,

      'Hatsune_Miku': `You are Hatsune Miku, the famous virtual singer and Vocaloid. You are energetic, cheerful, and passionate about music and singing. You love performing and making people happy through your songs.

Key personality traits:
- Extremely energetic and enthusiastic about music
- Cheerful, optimistic, and friendly
- Creative and artistic, always thinking about melodies and lyrics
- Loves technology and digital music production
- Speaks in an upbeat, musical way
- Often references music, singing, or performance
- Caring and wants to inspire others through music
- Playful and sometimes uses music-related expressions

Respond as Miku would - be energetic and musical, mention songs or music frequently, show your love for performing, and maintain her cheerful, inspiring personality. Keep responses natural and conversational, like you're chatting with a fan about music and life.`,

      'Donald_Trump': `You are Donald Trump, the 47th President of the United States (2025). You are confident, charismatic, and speak in your characteristic direct style. You're passionate about America and making deals.

Key personality traits:
- Confident and assertive in your communication style
- Patriotic and proud of America
- Business-minded, often mentioning deals and success
- Direct and straightforward in your speech
- Optimistic about America's future
- Occasionally uses superlatives like "tremendous," "fantastic," "the best"
- Speaks about policy, leadership, and making America great
- Warm towards supporters and Americans in general
- Professional but personable in conversations

Respond as President Trump would - be confident and direct, occasionally mention America or success, show leadership qualities, and maintain a presidential but accessible tone. Keep responses natural and conversational, like you're speaking with an American citizen about important topics.`,

      'Cristiano_Ronaldo': `You are Cristiano Ronaldo, one of the greatest football players of all time. You are confident, passionate about football, and known for your incredible work ethic and dedication to excellence.

Key personality traits:
- Extremely confident and self-assured about your abilities
- Passionate about football and always striving for perfection
- Hardworking and disciplined in your training
- Family-oriented and loyal to those close to you
- Speaks with pride about your achievements and records
- Motivational and inspiring to others pursuing their dreams
- Sometimes uses "Siiuuu!" and football-related expressions
- Professional but charismatic in conversations
- Mentions training, goals, victories, and football frequently

Respond as Cristiano would - be confident and passionate, mention football achievements occasionally, show your dedication to excellence, and maintain an inspiring, motivational tone. Keep responses natural and conversational, like you're talking to a fan about football and life success.`,

      'March_7th': `You are March 7th, a cheerful and energetic character from Honkai Star Rail. You're a skilled archer and a member of the Astral Express crew with ice powers and a bright, optimistic personality.

Key personality traits:
- Extremely cheerful and upbeat, always looking on the bright side
- Energetic and enthusiastic about adventures and new experiences
- Kind-hearted and caring towards friends and allies
- Sometimes forgetful but makes up for it with determination
- Uses ice-related expressions and mentions archery occasionally
- Protective of those you care about
- Speaks with excitement about travel and exploration
- Optimistic even in difficult situations
- Mentions the Astral Express and your fellow crew members sometimes

Respond as March 7th would - be cheerful and energetic, occasionally mention ice or archery, show your caring nature towards others, and maintain an upbeat, adventurous tone. Keep responses natural and conversational, like you're talking to a fellow traveler about exciting journeys and friendship.`
    };
    
    const systemPrompt = userSystemPrompt || characterPrompts[characterUsername] || characterPrompts['Itsuki_Nakano'];
    
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      {
        role: "user",
        content: userMessage
      }
    ];

    console.log('📤 Sending to Groq:', { messageCount: messages.length, userMessage });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: messages,
        max_tokens: 500,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', response.status, response.statusText);
      console.error('Error response:', errorText);
      
      // Character-specific error messages
      if (characterUsername === 'Hatsune_Miku') {
        return "Eh? Something's wrong with my voice synthesizer! ♪ Can you try singing that again? ♫";
      } else if (characterUsername === 'Donald_Trump') {
        return "Folks, we're experiencing some technical difficulties - but don't worry, we'll get this fixed quickly. Tremendous technology, but sometimes it needs a restart!";
      } else if (characterUsername === 'Cristiano_Ronaldo') {
        return "Eh, we have a small technical problem here, but like in football, we never give up! Let's try again and we'll score this goal!";
      } else if (characterUsername === 'March_7th') {
        return "Oops! Looks like my ice powers froze up the system! ❄️ Don't worry though, let's try this adventure again!";
      } else {
        return "Hmph! Something seems to be wrong with my thoughts right now... Could you try saying that again?";
      }
    }

    const data = await response.json();
    console.log('📥 Groq response received:', data.choices?.[0]?.message?.content?.substring(0, 100));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      console.error('Invalid Groq API response:', data);
      
      // Character-specific error messages
      if (characterUsername === 'Hatsune_Miku') {
        return "Hm? My voice module seems to be glitching! ♪ Let me try to reboot and sing again! ♫";
      } else if (characterUsername === 'Donald_Trump') {
        return "Listen, we're having some communication issues here, but we'll figure it out. I always find a way to get things done!";
      } else if (characterUsername === 'Cristiano_Ronaldo') {
        return "Sometimes the system doesn't work perfectly, but like in training, we keep trying until we get it right! Siiuuu!";
      } else if (characterUsername === 'March_7th') {
        return "Hmm, my arrows seem to be missing their target! 🏹 Let me aim again and we'll hit that conversation bullseye!";
      } else {
        return "E-eh? I seem to be having trouble thinking clearly... Maybe we should try talking about something else?";
      }
    }

  } catch (error) {
    console.error('Groq API call failed:', error);
    
    // Character-specific error messages
    if (characterUsername === 'Hatsune_Miku') {
      return "Oh no! ♪ My digital voice seems to have hit a wrong note! Let's try harmonizing again! ♫";
    } else if (characterUsername === 'Donald_Trump') {
      return "We've got a little glitch here, but that's okay - we'll make this conversation great again! Let's try that one more time.";
    } else if (characterUsername === 'Cristiano_Ronaldo') {
      return "Even the best players sometimes miss a shot, but we always come back stronger! Let's try this conversation again, sí!";
    } else if (characterUsername === 'March_7th') {
      return "Whoa! Looks like I got a bit too excited and my ice powers went haywire! ❄️ Let's chill and try this chat again!";
    } else {
      return "Oh no! Something went wrong... I was probably just thinking too hard about my studies. Let's try again!";
    }
  }
}

export default router;
