import { IMessengerContact } from '@/domain/MessengerContact';
import mongoose, { Schema } from 'mongoose';

const messengerContactSchema = new Schema<IMessengerContact>(
  {
    userId: { type: String, required: true },
    pageId: { type: String, required: true },
    firstName: { type: String, },
    lastName: { type: String },
    profilePic: { type: String },
    lastInteraction: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessage: { type: String },
    unreadCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const MessengerContact =
  mongoose.models.MessengerContact ||
  mongoose.model('MessengerContact', messengerContactSchema);

export default MessengerContact;
