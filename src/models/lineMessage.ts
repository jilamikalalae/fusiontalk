import { ILineContact, ILineMessage } from '@/domain/LineMessage';
import mongoose, { Schema } from 'mongoose';
import { MessageType } from '@/enum/enum';

const LineMessageSchema = new Schema<ILineMessage>({
  messageType: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LineContactSchema = new Schema<ILineContact>({
  incomingLineId: { type: String, required: true },
  outgoingLineId: { type: String, required: true },
  displayName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  profileUrl: { type: String, required: true },
  statusMessage: { type: String, required: true },
  lastMessage: { type: String, required: true },
  lastMessageAt: { type: Date, required: true },
  unreadCount: { type: Number, required: true },
  messages: [LineMessageSchema]
});

const LineContact =
  mongoose.models.LineContact ||
  mongoose.model<ILineContact>('LineContact', LineContactSchema);

const LineMessage =
  mongoose.models.LineMessage ||
  mongoose.model<ILineMessage>('LineMessage', LineMessageSchema);

export { LineContact, LineMessage };
