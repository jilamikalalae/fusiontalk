import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['user', 'bot'],
    default: 'user',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

const lineMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
  messages: [messageSchema]
}, { timestamps: true });

// Add index for userId
lineMessageSchema.index({ userId: 1 });
lineMessageSchema.index({ 'messages.createdAt': -1 });

const LineMessage = mongoose.models.LineMessage || mongoose.model('LineMessage', lineMessageSchema);

export default LineMessage;