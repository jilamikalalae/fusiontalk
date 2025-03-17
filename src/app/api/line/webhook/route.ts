import { MessageType } from '@/enum/enum';
import { DecryptString } from '@/lib/crypto';
import connectMongoDB from '@/lib/mongodb';
import { uploadToS3 } from '@/lib/s3';
import { ILineContact } from '@/domain/LineMessage';
import { LineContact } from '@/models/lineMessage';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// At the top, add type definition
type ContentType = 'image' | 'text' | undefined;
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('LINE webhook payload:', JSON.stringify(body, null, 2));

    if (
      !body.events ||
      !Array.isArray(body.events) ||
      body.events.length === 0
    ) {
      console.log('Received empty events array or ping from LINE');
      return NewResponse(200, null, null);
    }

    await connectMongoDB();

    for (const event of body.events) {
      if (event.type !== 'message') continue;

      const user = await User.findOne({ 'lineToken.userId': body.destination });

      if (!user?.lineToken?.accessToken) {
        console.log('User is not connected with LINE');
        continue;
      }

      const accessToken = DecryptString(
        user.lineToken.accessToken,
        user.lineToken.accessTokenIv
      );

      // Fetch user profile from LINE
      const profileResponse = await fetch(
        `https://api.line.me/v2/bot/profile/${event.source.userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (!profileResponse.ok) {
        console.error('Failed to get LINE profile:', profileResponse.status);
        continue;
      }

      const profile = await profileResponse.json();

      // Determine message type and content
      let messageContent = '';
      let contentType: ContentType = 'text';
      let imageUrl = '';

      if (event.message.type === 'text') {
        messageContent = event.message.text;
      } else if (event.message.type === 'image') {
        contentType = 'image';
        messageContent = 'Sent an image';

        try {
          const contentResponse = await fetch(
            `https://api-data.line.me/v2/bot/message/${event.message.id}/content`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (!contentResponse.ok)
            throw new Error(
              `Failed to get image content: ${contentResponse.status}`
            );

          const imageBuffer = await contentResponse.arrayBuffer();
          const fileName = `line/${body.destination}/${event.source.userId}/${uuidv4()}.jpg`;

          imageUrl = await uploadToS3(
            Buffer.from(imageBuffer),
            fileName,
            'image/jpeg'
          );
          console.log('Successfully uploaded LINE image to S3:', imageUrl);
        } catch (error) {
          console.error('Error processing LINE image:', error);
        }
      } else {
        messageContent = `Sent a ${event.message.type}`;
      }

      // **Atomic Upsert Operation**
      await LineContact.findOneAndUpdate(
        {
          incomingLineId: event.source.userId,
          outgoingLineId: body.destination
        },
        {
          $set: {
            displayName: profile.displayName,
            profileUrl: profile.pictureUrl || '',
            statusMessage: profile.statusMessage || '',
            lastMessage: messageContent,
            lastMessageAt: new Date(),
            updatedAt: new Date()
          },
          $inc: { unreadCount: 1 },
          $push: {
            messages: {
              messageType: MessageType.INCOMING,
              content: messageContent,
              createdAt: new Date(),
              contentType,
              imageUrl: imageUrl || undefined
            }
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
