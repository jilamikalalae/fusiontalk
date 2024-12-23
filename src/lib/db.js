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
  
  // Get all contacts
  const contacts = await LineContact.find({}).lean();
  
  // Get the latest message for each contact
  const contactsWithMessages = await Promise.all(
    contacts.map(async (contact) => {
      // Find latest message where either:
      // - userId matches (user's message)
      // - replyTo matches (bot's reply)
      const latestMessage = await LineMessage.findOne({ 
        $or: [
          { userId: contact.userId },
          { replyTo: contact.userId }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

      return {
        ...contact,
        lastMessage: latestMessage ? latestMessage.content : '',
        lastMessageAt: latestMessage ? latestMessage.createdAt : contact.lastMessageAt,
      };
    })
  );

  // Sort contacts by latest message timestamp
  return contactsWithMessages.sort((a, b) => 
    (b.lastMessageAt || 0) - (a.lastMessageAt || 0)
  );
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