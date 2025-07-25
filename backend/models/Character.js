import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  personality: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  avatar: {
    type: String,
    default: null // Will store filename of uploaded avatar
  },
  systemPrompt: {
    type: String,
    required: true // Generated from personality and other inputs
  },
  background: {
    type: String,
    default: '',
    maxLength: 1000
  },
  responseStyle: {
    type: String,
    enum: ['formal', 'casual', 'energetic', 'calm', 'humorous', 'serious'],
    default: 'casual'
  },
  isOfficial: {
    type: Boolean,
    default: false // True for your original 5 characters
  },
  isPublic: {
    type: Boolean,
    default: true // All user-created characters are public
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByUsername: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  usageCount: {
    type: Number,
    default: 0
  },
  rating: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better performance
characterSchema.index({ isPublic: 1, createdAt: -1 });
characterSchema.index({ createdBy: 1 });
characterSchema.index({ name: 'text', description: 'text', personality: 'text' });

// Generate system prompt automatically
characterSchema.pre('save', function(next) {
  if (this.isModified('personality') || this.isModified('background') || this.isModified('responseStyle')) {
    this.systemPrompt = this.generateSystemPrompt();
  }
  next();
});

characterSchema.methods.generateSystemPrompt = function() {
  const stylePrompts = {
    formal: "Speak in a formal, professional manner.",
    casual: "Speak in a casual, friendly manner.",
    energetic: "Speak with enthusiasm and energy.",
    calm: "Speak in a calm, peaceful manner.",
    humorous: "Be witty and humorous in your responses.",
    serious: "Maintain a serious, thoughtful tone."
  };

  const styleText = stylePrompts[this.responseStyle] || stylePrompts.casual;
  
  let prompt = `You are ${this.name}. ${this.description}\n\nPersonality: ${this.personality}\n\n${styleText}`;
  
  if (this.background) {
    prompt += `\n\nBackground: ${this.background}`;
  }
  
  prompt += `\n\nStay in character and respond as ${this.name} would. Be consistent with your personality and background.`;
  
  return prompt;
};

// Method to increment usage count
characterSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

export default mongoose.model('Character', characterSchema);
