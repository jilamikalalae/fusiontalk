import MessengerContact from '@/models/messengerContact';
import MessengerMessage from '@/models/messengerMessage';
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

// Messenger Functions
export async function storeMessengerMessage(messageData) {
  try {
    await connectMongoDB();
    
    const newMessage = new MessengerMessage({
      senderId: messageData.senderId,
      recipientId: messageData.recipientId,
      senderName: messageData.senderName,
      messageType: messageData.messageType,
      content: messageData.content,
      messageId: messageData.messageId,
      timestamp: messageData.timestamp || new Date(),
      isRead: messageData.isRead || false,
    });

    console.log('Storing message:', newMessage);
    return await newMessage.save();
  } catch (error) {
    console.error('Error storing Messenger message:', error);
    throw error;
  }
}

export async function upsertMessengerContact(contactData) {
  try {
    await connectMongoDB();
    
    const contact = await MessengerContact.findOneAndUpdate(
      { userId: contactData.userId },
      {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        profilePic: contactData.profilePic,
        lastInteraction: new Date(),
      },
      { upsert: true, new: true }
    );

    return contact;
  } catch (error) {
    console.error('Error upserting Messenger contact:', error);
    throw error;
  }
}

export async function getMessengerMessages(userId = null) {
  try {
    await connectMongoDB();
    const query = userId ? {
      $or: [
        { senderId: userId },
        { recipientId: userId }
      ]
    } : {};
    
    return await MessengerMessage.find(query)
      .sort({ timestamp: 1 })
      .lean();
  } catch (error) {
    console.error('Error fetching Messenger messages:', error);
    throw error;
  }
}

export async function getMessengerContacts() {
  try {
    await connectMongoDB();
    return await MessengerContact.find().sort({ lastInteraction: -1 });
  } catch (error) {
    console.error('Error fetching Messenger contacts:', error);
    throw error;
  }
}