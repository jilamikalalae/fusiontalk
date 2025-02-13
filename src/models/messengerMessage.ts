import mongoose from 'mongoose';

const messengerMessageSchema = new mongoose.Schema({
  senderId: String,
  recipientId: String,
  senderName: String,
  messageType: String, // 'user' or 'page'
  content: String,
  messageId: String,
  timestamp: Date,
  isRead: Boolean,
});

export default mongoose.models.MessengerMessage || mongoose.model('MessengerMessage', messengerMessageSchema);