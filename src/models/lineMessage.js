import mongoose from 'mongoose';

const lineMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
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
  replyTo: {
    type: String,
    required: false,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Add indexes if needed
lineMessageSchema.index({ userId: 1, createdAt: -1 });
lineMessageSchema.index({ replyTo: 1 });

const LineMessage = mongoose.models.LineMessage || mongoose.model('LineMessage', lineMessageSchema);

export default LineMessage;