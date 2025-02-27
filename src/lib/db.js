import MessengerContact from '@/models/messengerContact';
import MessengerMessage from '@/models/messengerMessage';
import connectMongoDB from '@/lib/mongodb';

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
      isRead: messageData.isRead || false
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
        lastInteraction: new Date()
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
    const query = userId
      ? {
          $or: [
            // Only get messages between the page and this specific user
            { senderId: userId, recipientId: 'page' },
            { senderId: 'page', recipientId: userId }
          ]
        }
      : {};

    // console.log('Messages query:', query); // For debugging

    const messages = await MessengerMessage.find(query)
      .sort({ timestamp: 1 })
      .lean();

    // console.log('Found messages:', messages.length); // For debugging

    return messages;
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
