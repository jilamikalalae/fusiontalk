import LineContact from '@/models/lineContact';
import LineMessage from '@/models/lineMessage';
import { connectMongoDB } from '@/lib/mongodb';

// LINE Contacts
export async function upsertLineContact({ userId, displayName, pictureUrl, statusMessage }) {
  await connectMongoDB();
  return await LineContact.findOneAndUpdate(
    { userId },
    {
      userId,
      displayName,
      pictureUrl,
      statusMessage,
    },
    { upsert: true, new: true }
  );
}

export async function getLineContacts() {
  await connectMongoDB();
  return await LineContact.find({})
    .sort({ lastMessageAt: -1 })
    .lean();
}

// LINE Messages
export async function storeLineMessage(messageData) {
  try {
    await connectMongoDB();
    
    const newMessage = new LineMessage({
      userId: messageData.userId,
      userName: messageData.userName,
      content: messageData.content,
      messageType: messageData.messageType,
      createdAt: messageData.createdAt,
      replyTo: messageData.replyTo,
      isRead: false,
    });

    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (error) {
    console.error('Error storing LINE message:', error);
    throw error;
  }
}

export async function getLineMessages(userId = null) {
  await connectMongoDB();
  const query = userId ? { userId } : {};
  return await LineMessage.find(query)
    .sort({ createdAt: -1 })
    .lean();
}

export async function markMessagesAsRead(userId) {
  await connectMongoDB();
  return await LineMessage.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
} 