import mongoose, { Schema } from 'mongoose';

const lineContactSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    pictureUrl: { type: String },
    statusMessage: { type: String },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
  { collection: 'lineContacts', db: 'fusionTalk' }
);

const LineContact = mongoose.models.LineContact || mongoose.model("LineContact", lineContactSchema);
export default LineContact; 