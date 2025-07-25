import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      required: function() {
        return this.isGroup;
      }
    },
    groupAvatar: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Ensure at least 2 participants
conversationSchema.pre('save', function(next) {
  if (this.participants.length < 2) {
    next(new Error('A conversation must have at least 2 participants'));
  } else {
    next();
  }
});

export default mongoose.model('Conversation', conversationSchema);