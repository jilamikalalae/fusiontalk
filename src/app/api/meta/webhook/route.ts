import { IUser } from '@/domain/User';
import { MessageType } from '@/enum/enum';
import { DecryptString } from '@/lib/crypto';
import { storeMessengerMessage, upsertMessengerContact } from '@/lib/db';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';

import { NextRequest, NextResponse } from 'next/server';

// API FOR VERIFY WEBHOOK API
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl?.searchParams.get('hub.challenge');
  return new Response(challenge);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messaging = body.entry?.[0]?.messaging;

  if (!messaging || !messaging[0] || !messaging[0].message.text) {
    console.log('This is not message data');
    return NewResponse(400, null, 'This is not message data');
  }

  const senderId = messaging[0].sender.id;

  try {
    if (messaging[0].message) {
      await connectMongoDB();

      const user: IUser | null = await User.findOne({
        'messengerToken.pageId': messaging[0].recipient.id
      });

      if (!user?.messengerToken?.accessToken) {
        console.log('user is not connect with meta.');
        return NewResponse(409, null, 'user is not connect to meta');
      }

      const accessToken = DecryptString(
        user.messengerToken.accessToken,
        user.messengerToken.accessTokenIv
      );

      const getProfileUrl = `https://graph.facebook.com/${senderId}?fields=first_name,last_name,profile_pic&access_token=${accessToken}`;
      const response = await fetch(getProfileUrl);
      const profile = await response.json();

      // If there's a message, store it
      await upsertMessengerContact({
        userId: senderId,
        pageId: messaging[0].recipient.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        profilePic: profile.profile_pic
      });

      await storeMessengerMessage({
        senderId: senderId,
        recipientId: messaging[0].recipient.id,
        senderName: `${profile.first_name} ${profile.last_name}`,
        messageType: MessageType.INCOMING,
        content: messaging[0].message.text,
        messageId: messaging[0].message.mid,
        timestamp: new Date(messaging[0].timestamp)
      });
    }

    return NewResponse(200, null, null);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NewResponse(500, null, error.message);
  }
}
