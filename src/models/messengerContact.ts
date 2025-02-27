import { IMessengerContact } from '@/domain/MessengerContact';
import mongoose, { Schema } from 'mongoose';

const messengerContactSchema = new Schema<IMessengerContact>({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  profilePic: { type: String },
  lastInteraction: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.MessengerContact || mongoose.model('MessengerContact', messengerContactSchema); 