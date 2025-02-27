import { IMessengerMessage } from '@/domain/MessengerMessage';
import { MessageType } from '@/enum/enum';
import mongoose, { Schema } from 'mongoose';

const messengerMessageSchema = new Schema<IMessengerMessage>({
  senderId: { type: String, required: true },
  recipientId: { type: String, required: true },
  senderName: String,
  messageType: {
    type: String,
    required: true,
    enum: ['user', 'page']
  },
  content: { type: String, required: true },
  messageId: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

export default mongoose.models.MessengerMessage ||
  mongoose.model('MessengerMessage', messengerMessageSchema);
