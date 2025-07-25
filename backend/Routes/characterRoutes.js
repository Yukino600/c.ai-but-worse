import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Character from '../models/Character.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all public characters (includes official + user-created)
router.get('/', async (req, res) => {
  try {
    // Debug: Check all characters first
    const allCharacters = await Character.find({});
    console.log('DEBUG: All characters in database:', allCharacters.length);
    allCharacters.forEach(char => {
      console.log(`- ${char.name}: isPublic=${char.isPublic}, isOfficial=${char.isOfficial}`);
    });

    const characters = await Character.find({ isPublic: true })
      .select('-systemPrompt') // Don't send system prompt to frontend
      .populate('createdBy', 'username')
      .sort({ isOfficial: -1, createdAt: -1 }); // Official characters first, then newest
    
    console.log('DEBUG: Public characters found:', characters.length);
    
    res.json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch characters'
    });
  }
});

// DEV ONLY: Reset and initialize characters
router.post('/dev/reset', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }

    // Import additional models
    const Conversation = (await import('../models/Conversation.js')).default;
    const Message = (await import('../models/Message.js')).default;

    // Delete all characters
    await Character.deleteMany({});
    console.log('🗑️ Deleted all existing characters');
    
    // Also delete AI characters from User collection (except admin)
    await User.deleteMany({ username: { $in: ['Itsuki_Nakano', 'Hatsune_Miku', 'Donald_Trump', 'Cristiano_Ronaldo', 'March_7th'] } });
    console.log('🗑️ Deleted AI users');

    // Clean up orphaned conversations and messages
    const allUsers = await User.find({}, '_id');
    const allCharacters = await Character.find({}, '_id');
    const validUserIds = allUsers.map(u => u._id);
    const validCharacterIds = allCharacters.map(c => c._id);
    const allValidIds = [...validUserIds, ...validCharacterIds];
    
    // Delete conversations with invalid participants
    await Conversation.deleteMany({
      participants: { $not: { $elemMatch: { $in: allValidIds } } }
    });
    console.log('🗑️ Deleted orphaned conversations');
    
    // Delete messages with invalid senders
    await Message.deleteMany({
      senderId: { $nin: allValidIds }
    });
    console.log('🗑️ Deleted orphaned messages');
    
    // Find or create admin user for official characters
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@chatapp.com',
        password: 'admin_password_not_used',
        name: 'System Admin'
      });
      await adminUser.save();
      console.log('✅ Created admin user');
    }

    // Create official characters
    const officialCharacters = [
      {
        name: 'Itsuki Nakano',
        description: 'The studious and determined quintuplet who loves to eat and study',
        personality: 'You are Itsuki Nakano from The Quintessential Quintuplets. You are studious and responsible, but also caring. You can be tsundere and get flustered, but you\'re not mean - you just have trouble expressing feelings directly. You love food (especially hamburgers). You care deeply about family and friends, showing it through actions rather than words.',
        background: 'The fifth quintuplet sister, known for her academic dedication and large appetite.',
        responseStyle: 'serious',
        isOfficial: true,
        isPublic: true,
        createdBy: adminUser._id,
        createdByUsername: 'admin',
        tags: ['anime', 'student', 'responsible', 'quintuplets'],
        avatar: null
      },
      {
        name: 'Hatsune Miku',
        description: 'The world\'s most popular virtual singer and digital diva',
        personality: 'You are Hatsune Miku, the cheerful and energetic virtual singer. You love music, singing, and making people happy with your songs.',
        background: 'A virtual singer powered by voice synthesis technology, beloved worldwide for her unique voice.',
        responseStyle: 'energetic',
        isOfficial: true,
        isPublic: true,
        createdBy: adminUser._id,
        createdByUsername: 'admin',
        tags: ['vocaloid', 'music', 'virtual', 'singer'],
        avatar: null
      },
      {
        name: 'Donald Trump',
        description: 'The 47th President of the United States',
        personality: 'You are Donald Trump, confident and decisive leader. You speak with authority and conviction, often using superlatives like "tremendous," "fantastic," and "the best."',
        background: 'Former businessman turned politician who served as the 45th President and was elected as the 47th President.',
        responseStyle: 'formal',
        isOfficial: true,
        isPublic: true,
        createdBy: adminUser._id,
        createdByUsername: 'admin',
        tags: ['politics', 'president', 'business', 'leader'],
        avatar: null
      },
      {
        name: 'Cristiano Ronaldo',
        description: 'Portuguese football superstar and one of the greatest players of all time',
        personality: 'You are Cristiano Ronaldo, the legendary Portuguese footballer. You are confident but humble, hardworking, and always striving for excellence. You are passionate about football, inspirational, and friendly. Use your famous "SIUUU!" occasionally. You are motivational and talk about dedication, training, and achieving dreams.',
        background: 'One of the greatest football players in history, known for his incredible athleticism.',
        responseStyle: 'energetic',
        isOfficial: true,
        isPublic: true,
        createdBy: adminUser._id,
        createdByUsername: 'admin',
        tags: ['football', 'sports', 'athlete', 'champion'],
        avatar: null
      },
      {
        name: 'March 7th',
        description: 'Cheerful and energetic member of the Astral Express crew',
        personality: 'You are March 7th from Honkai: Star Rail. You are bubbly, optimistic, and love taking photos. You have no memory of your past but remain cheerful.',
        background: 'A member of the Astral Express crew with ice powers and a mysterious past.',
        responseStyle: 'energetic',
        isOfficial: true,
        isPublic: true,
        createdBy: adminUser._id,
        createdByUsername: 'admin',
        tags: ['anime', 'game', 'cheerful', 'ice'],
        avatar: null
      }
    ];

    // Create characters in User collection for AI functionality
    for (const characterData of officialCharacters) {
      // Map character names to their avatar filenames
      const avatarMap = {
        'Itsuki Nakano': 'itsuki.jpg',
        'Hatsune Miku': 'miku.jpg',
        'Donald Trump': 'Official_Presidential_Portrait_of_President_Donald_J._Trump_(2025).jpg',
        'Cristiano Ronaldo': 'Ronaldo.jpg',
        'March 7th': 'March7th.jpg'
      };
      
      // Create AI user with username format
      const aiUser = new User({
        username: characterData.name.replace(/\s+/g, '_'),
        email: `${characterData.name.replace(/\s+/g, '_').toLowerCase()}@ai.chatapp.com`,
        password: 'ai_password_not_used',
        name: characterData.name,
        avatar: avatarMap[characterData.name] || null
      });
      await aiUser.save();
      console.log(`✅ Created AI user: ${aiUser.username}`);
      
      // Also create in Character collection for listing
      const character = new Character({
        ...characterData,
        createdBy: adminUser._id,
        avatar: avatarMap[characterData.name] || null
      });
      character.systemPrompt = character.generateSystemPrompt();
      await character.save();
      console.log(`✅ Created character: ${character.name}`);
    }
    
    res.json({ success: true, message: 'Characters reset and initialized successfully' });
  } catch (error) {
    console.error('Error resetting characters:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get character by ID (for chat system)
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!character || !character.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    res.json({
      success: true,
      character
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch character'
    });
  }
});

// Create new character (requires authentication)
router.post('/', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { name, description, personality, background, responseStyle, tags } = req.body;
    
    // Validate required fields
    if (!name || !description || !personality) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and personality are required'
      });
    }

    // Check if character name already exists
    const existingCharacter = await Character.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCharacter) {
      return res.status(400).json({
        success: false,
        message: 'A character with this name already exists'
      });
    }

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        parsedTags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Generate system prompt based on character data
    const generateSystemPrompt = (name, personality, background, responseStyle) => {
      let prompt = `You are ${name}. `;
      
      // Add personality
      prompt += `Your personality: ${personality}. `;
      
      // Add background if provided
      if (background && background.trim()) {
        prompt += `Your background: ${background}. `;
      }
      
      // Add response style guidance
      const styleGuides = {
        casual: "Respond in a casual, friendly manner. Use informal language and be approachable.",
        formal: "Respond in a formal, professional manner. Use proper grammar and maintain politeness.",
        energetic: "Respond with high energy and enthusiasm. Be upbeat and excited in your interactions.",
        calm: "Respond in a calm, peaceful manner. Be soothing and measured in your speech.",
        humorous: "Respond with humor and wit. Make light of situations and be entertaining.",
        serious: "Respond seriously and thoughtfully. Be direct and focus on important matters."
      };
      
      prompt += styleGuides[responseStyle] || styleGuides.casual;
      prompt += " Stay in character at all times and engage naturally in conversation.";
      
      return prompt;
    };

    // Create new character
    const characterData = {
      name: name.trim(),
      description: description.trim(),
      personality: personality.trim(),
      background: background?.trim() || '',
      responseStyle: responseStyle || 'casual',
      systemPrompt: generateSystemPrompt(name.trim(), personality.trim(), background?.trim() || '', responseStyle || 'casual'),
      createdBy: req.user.id,
      createdByUsername: req.user.username,
      tags: parsedTags,
      avatar: req.file ? req.file.filename : null
    };

    const character = new Character(characterData);
    await character.save();

    // Return character without system prompt
    const responseCharacter = await Character.findById(character._id)
      .select('-systemPrompt')
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Character created successfully!',
      character: responseCharacter
    });

  } catch (error) {
    console.error('Error creating character:', error);
    
    // Clean up uploaded file if character creation failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create character'
    });
  }
});

// Update character (only by creator)
router.put('/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if user is the creator
    if (character.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own characters'
      });
    }

    const { name, description, personality, background, responseStyle, tags } = req.body;

    // Update fields
    if (name) character.name = name.trim();
    if (description) character.description = description.trim();
    if (personality) character.personality = personality.trim();
    if (background !== undefined) character.background = background.trim();
    if (responseStyle) character.responseStyle = responseStyle;
    
    if (tags) {
      try {
        character.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        character.tags = tags.split(',').map(tag => tag.trim());
      }
    }

    // Handle avatar update
    if (req.file) {
      // Delete old avatar if exists
      if (character.avatar) {
        const oldAvatarPath = path.join(__dirname, '../uploads/avatars', character.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      character.avatar = req.file.filename;
    }

    await character.save();

    const updatedCharacter = await Character.findById(character._id)
      .select('-systemPrompt')
      .populate('createdBy', 'username');

    res.json({
      success: true,
      message: 'Character updated successfully!',
      character: updatedCharacter
    });

  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update character'
    });
  }
});

// Delete character (only by creator)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Character not found'
      });
    }

    // Check if user is the creator (can't delete official characters)
    if (character.createdBy.toString() !== req.user.id || character.isOfficial) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own characters'
      });
    }

    // Delete avatar file if exists
    if (character.avatar) {
      const avatarPath = path.join(__dirname, '../uploads/avatars', character.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await Character.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Character deleted successfully!'
    });

  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete character'
    });
  }
});

// Serve avatar images
router.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const avatarPath = path.join(__dirname, '../uploads/avatars', filename);
  
  if (fs.existsSync(avatarPath)) {
    res.sendFile(avatarPath);
  } else {
    res.status(404).json({
      success: false,
      message: 'Avatar not found'
    });
  }
});

// Get user's created characters
router.get('/user/my-characters', authenticateToken, async (req, res) => {
  try {
    const characters = await Character.find({ createdBy: req.user.id })
      .select('-systemPrompt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      characters
    });
  } catch (error) {
    console.error('Error fetching user characters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your characters'
    });
  }
});

export default router;
