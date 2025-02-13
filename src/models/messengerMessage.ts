import mongoose from 'mongoose';

const messengerMessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: String,
  messageType: { 
    type: String, 
    required: true,
    enum: ['user', 'page']  // Only allow these two values
  },
  content: { type: String, required: true },
  messageId: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

export default mongoose.models.MessengerMessage || mongoose.model('MessengerMessage', messengerMessageSchema);