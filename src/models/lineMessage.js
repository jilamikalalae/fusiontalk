import mongoose, { Schema } from 'mongoose';

const lineMessageSchema = new Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    messageType: { type: String, enum: ['user', 'bot'], required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
  { collection: 'lineMessages', db: 'fusionTalk' }
);

const LineMessage = mongoose.models.LineMessage || mongoose.model("LineMessage", lineMessageSchema);
export default LineMessage; 