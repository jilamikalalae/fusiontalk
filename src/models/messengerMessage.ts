import { IMessengerMessage } from '@/domain/MessengerMessage';
import { MessageType } from '@/enum/enum';
import mongoose, { Schema } from 'mongoose';

const messengerMessageSchema = new Schema<IMessengerMessage>({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: String,
  messageType: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  content: { type: String, required: true },
  messageId: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  contentType: { type: String, enum: ['text', 'image'], default: 'text' },
  imageUrl: { type: String }
});

const MessengerMessage =
  mongoose.models.MessengerMessage ||
  mongoose.model('MessengerMessage', messengerMessageSchema);

export default MessengerMessage;
