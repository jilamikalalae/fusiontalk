import mongoose, { Document, Model } from 'mongoose';

interface IMessage {
  content: string;
  messageType: 'user' | 'bot';
  createdAt: Date;
  isRead: boolean;
}

interface ILineMessage extends Document {
  userId: string;
  userName: string;
  messages: IMessage[];
}

interface LineMessageModel extends Model<ILineMessage> {
  addMessage(userId: string, userName: string, content: string, messageType: string, replyTo?: string): Promise<ILineMessage>;
}

// ... rest of your existing schema code ...
const LineMessage = mongoose.models.LineMessage as LineMessageModel || 
  mongoose.model<ILineMessage, LineMessageModel>('LineMessage', new mongoose.Schema({}));

export default LineMessage; 