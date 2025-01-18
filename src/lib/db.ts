import LineContact from '@/models/lineContact';
import LineMessage from '@/models/lineMessage';
import { connectMongoDB } from '@/lib/mongodb';

interface MessageData {
  userId: string;
  userName: string;
  content: string;
  messageType: 'user' | 'bot';
  createdAt: Date;
}

interface LineContactData {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LineMessageDocument {
  userId: string;
  userName: string;
  messages: {
    content: string;
    messageType: 'user' | 'bot';
    createdAt: Date;
    isRead: boolean;
  }[];
}

// LINE Contacts
export async function upsertLineContact({ userId, displayName, pictureUrl, statusMessage }: LineContactData) {
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
  
  const contacts = await LineContact.find({}).lean();
  
  const contactsWithMessages = await Promise.all(
    contacts.map(async (contact) => {
      const userMessages = await LineMessage.findOne({ userId: contact.userId })
        .sort({ 'messages.createdAt': -1 })
        .lean() as unknown as LineMessageDocument;

      const lastMessage = userMessages?.messages?.[0];

      return {
        ...contact,
        lastMessage: lastMessage ? lastMessage.content : '',
        lastMessageAt: lastMessage ? lastMessage.createdAt : contact.lastMessageAt,
      };
    })
  );

  return contactsWithMessages.sort((a, b) => 
    (b.lastMessageAt || 0) - (a.lastMessageAt || 0)
  );
}

// LINE Messages
export async function storeLineMessage(messageData: MessageData) {
  try {
    await connectMongoDB();
    
    const messageDoc = {
      content: messageData.content,
      messageType: messageData.messageType,
      createdAt: messageData.createdAt,
      isRead: false,
    };

    const savedMessage = await LineMessage.findOneAndUpdate(
      { userId: messageData.userId },
      { 
        $setOnInsert: { userName: messageData.userName },
        $push: { messages: messageDoc }
      },
      { upsert: true, new: true }
    );

    return savedMessage;
  } catch (error) {
    console.error('Error storing LINE message:', error);
    throw error;
  }
}

export async function getLineMessages(userId?: string | null) {
  await connectMongoDB();
  const query = userId ? { userId } : {};
  return await LineMessage.find(query)
    .sort({ 'messages.createdAt': -1 })
    .lean();
}

export async function markMessagesAsRead(userId: string) {
  await connectMongoDB();
  return await LineMessage.updateOne(
    { userId },
    { $set: { 'messages.$[].isRead': true } }
  );
} 