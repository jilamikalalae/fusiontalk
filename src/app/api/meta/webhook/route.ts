import { IUser } from '@/domain/User';
import { MessageType } from '@/enum/enum';
import { DecryptString } from '@/lib/crypto';
import { storeMessengerMessage, upsertMessengerContact } from '@/lib/db';
import connectMongoDB from '@/lib/mongodb';
import { uploadToS3 } from '@/lib/s3';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// API FOR VERIFY WEBHOOK API
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl?.searchParams.get('hub.challenge');
  return new Response(challenge);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const messaging = body.entry?.[0]?.messaging;

  if (!messaging || !messaging[0] || !messaging[0].message) {
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

      // Get user profile from Meta
      const profileResponse = await fetch(
        `https://graph.facebook.com/${senderId}?fields=first_name,last_name,profile_pic&access_token=${accessToken}`
      );
      const profile = await profileResponse.json();

      let messageContent = '';
      let contentType = 'text';
      let imageUrl = '';

      // Handle different message types
      if (messaging[0].message.text) {
        // Text message
        messageContent = messaging[0].message.text;
      } else if (messaging[0].message.attachments && messaging[0].message.attachments.length > 0) {
        const attachment = messaging[0].message.attachments[0];
        
        if (attachment.type === 'image') {
          // Image message
          contentType = 'image';
          messageContent = 'Sent an image';
          
          try {
            // Download image from Meta
            const imageResponse = await fetch(attachment.payload.url);
            if (!imageResponse.ok) {
              throw new Error(`Failed to download image: ${imageResponse.status}`);
            }
            
            const imageBuffer = await imageResponse.arrayBuffer();
            const fileName = `meta/${messaging[0].recipient.id}/${senderId}/${uuidv4()}.jpg`;
            
            imageUrl = await uploadToS3(
              Buffer.from(imageBuffer),
              fileName,
              'image/jpeg'
            );
            
            console.log('Successfully uploaded Meta image to S3:', imageUrl);
          } catch (error) {
            console.error('Error processing Meta image:', error);
            // Continue without image URL if failed
          }
        } else {
          // Other attachment types
          messageContent = `Sent a ${attachment.type}`;
        }
      } else {
        // Unknown message type
        messageContent = 'Sent a message';
      }

      // If there's a message, store it
      await upsertMessengerContact({
        userId: senderId,
        pageId: messaging[0].recipient.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        profilePic: profile.profile_pic,
        lastMessage: messageContent
      });

      await storeMessengerMessage({
        senderId: senderId,
        recipientId: messaging[0].recipient.id,
        senderName: `${profile.first_name} ${profile.last_name}`,
        messageType: MessageType.INCOMING,
        content: messageContent,
        messageId: messaging[0].message.mid,
        timestamp: new Date(messaging[0].timestamp),
        contentType: contentType,
        imageUrl: imageUrl || undefined
      });
    }

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
