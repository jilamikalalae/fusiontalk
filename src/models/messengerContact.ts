import mongoose from 'mongoose';

const messengerContactSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String },
  profilePic: { type: String },
  lastInteraction: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.MessengerContact || mongoose.model('MessengerContact', messengerContactSchema); 