import LineContact from '@/models/lineContact';
import LineMessage from '@/models/lineMessage';
import { connectDB } from '@/lib/mongodb';

// LINE Contacts
export async function upsertLineContact({ userId, displayName, pictureUrl, statusMessage }) {
  await connectDB();
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
  await connectDB();
  return await LineContact.find({})
    .sort({ lastMessageAt: -1 })
    .lean();
}

// LINE Messages
export async function storeLineMessage(userId, userName, content, messageType) {
  await connectDB();
  
  // Create the message
  const message = await LineMessage.create({
    userId,
    userName,
    content,
    messageType,
    isRead: false,
  });

  // Update the contact's last message
  if (userId !== 'BOT') {
    await LineContact.findOneAndUpdate(
      { userId },
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      }
    );
  }

  return message;
}

export async function getLineMessages(userId = null) {
  await connectDB();
  const query = userId ? { userId } : {};
  return await LineMessage.find(query)
    .sort({ createdAt: -1 })
    .lean();
}

export async function markMessagesAsRead(userId) {
  await connectDB();
  return await LineMessage.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
} 