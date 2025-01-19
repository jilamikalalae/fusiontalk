import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['user', 'bot'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

const lineMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
  },
  messages: [messageSchema]
}, { timestamps: true });

// Add indexes
lineMessageSchema.index({ userId: 1 });
lineMessageSchema.index({ 'messages.createdAt': -1 });

// Add static method to add a message
lineMessageSchema.statics.addMessage = async function(userId, userName, content, messageType = 'user', replyTo = null) {
  const message = {
    content,
    messageType,
    createdAt: new Date(),
    isRead: false
  };

  const result = await this.findOneAndUpdate(
    { userId },
    { 
      $push: { messages: message },
      $setOnInsert: { userName }
    },
    { 
      upsert: true, 
      new: true,
      runValidators: true
    }
  );
  
  return result;
};

const LineMessage = mongoose.models.LineMessage || mongoose.model('LineMessage', lineMessageSchema);

export default LineMessage;