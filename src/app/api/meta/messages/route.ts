import { NextResponse } from 'next/server';
import { NewResponse } from '@/types/api-response';
import connectMongoDB from '@/lib/mongodb';
import MessengerMessage from '@/models/messengerMessage';
import { IMessengerMessage } from '@/domain/MessengerMessage';
import { IUser } from '@/domain/User';
import User from '@/models/user';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { MessageType } from '@/enum/enum';
import { v4 } from 'uuid';
import { DecryptString } from '@/lib/crypto';
import { upsertMessengerContact } from '@/lib/db';
import { IMessengerContact } from '@/domain/MessengerContact';
import MessengerContact from '@/models/messengerContact';

export async function POST(req: Request) {
  try {
    const messageData = await req.json();
    await connectMongoDB();

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const user: IUser | null = await User.findById(session.user.id);

    if (!user?.messengerToken?.accessToken || !user?.messengerToken?.pageId) {
      return NewResponse(409, null, 'user is not connect with meta.');
    }

    const accessToken = DecryptString(
      user.messengerToken.accessToken,
      user.messengerToken.accessTokenIv
    );

    const requestBody = {
      messaging_type: 'RESPONSE',
      recipient: { id: messageData.recipientId },
      message: { text: messageData.content }
    };

    console.log(requestBody)

    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    

    const data = await response.json();

    console.log('Facebook API full response:', data);

    if (!response.ok) {
      return NewResponse(502, null, data.error);
    }

    const newMessage: IMessengerMessage = {
      senderId: user.messengerToken.pageId,
      recipientId: messageData.recipientId,
      senderName: user.name,
      messageType: MessageType.OUTGOING,
      content: messageData.content,
      messageId: v4(),
      timestamp: new Date(),
      isRead: true
    };

    await MessengerMessage.create(newMessage);

    const messengerContact: IMessengerContact | null =
      await MessengerContact.findOne({
        pageId: user.messengerToken.pageId,
        userId: messageData.recipientId
      });

    if (!messengerContact) {
      return NewResponse(404, null, 'messenger contact is not found');
    }

    await upsertMessengerContact({
      userId: messageData.recipientId,
      pageId: user.messengerToken.pageId,
      firstName: messengerContact.firstName,
      lastName: messengerContact.lastName,
      profilePic: messengerContact.profilePic,
      lastMessage: messageData.content
    });

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error storing message:', error);
    return NextResponse.json(
      { error: 'Failed to store message' },
      { status: 500 }
    );
  }
}
