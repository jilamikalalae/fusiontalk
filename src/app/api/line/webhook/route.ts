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

    // If events array is empty, just return 200 OK
    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      console.log('Received empty events array or ping from LINE');
      return NewResponse(200, null, null);
    }

    await connectMongoDB();

    for (const event of body.events) {
      // Only process message events
      if (event.type !== 'message') {
        continue;
      }

      const user = await User.findOne({
        'lineToken.userId': body.destination
      });

      if (!user?.lineToken?.accessToken) {
        console.log('User is not connected with LINE');
        continue;
      }

      const accessToken = DecryptString(
        user.lineToken.accessToken,
        user.lineToken.accessTokenIv
      );

      // Get user profile from LINE
      const profileResponse = await fetch(
        `https://api.line.me/v2/bot/profile/${event.source.userId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (!profileResponse.ok) {
        console.error('Failed to get LINE profile:', profileResponse.status);
        continue;
      }

      const profile = await profileResponse.json();

      // Process message content
      let messageContent = '';
      let contentType: ContentType = 'text';
      let imageUrl = '';

      if (event.message.type === 'text') {
        // Text message
        messageContent = event.message.text;
      } else if (event.message.type === 'image') {
        // Image message
        contentType = 'image';
        messageContent = 'Sent an image'; // Ensure content is always set

        try {
          // Get image content from LINE
          const contentResponse = await fetch(
            `https://api-data.line.me/v2/bot/message/${event.message.id}/content`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );

          if (!contentResponse.ok) {
            throw new Error(`Failed to get image content: ${contentResponse.status}`);
          }

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
          // Continue without image URL if failed
        }
      } else {
        // Other message types
        messageContent = `Sent a ${event.message.type}`;
      }

      // Create or update LINE contact
      const lineContact: ILineContact = {
        incomingLineId: event.source.userId,
        outgoingLineId: body.destination,
        displayName: profile.displayName,
        profileUrl: profile.pictureUrl || '',
        statusMessage: profile.statusMessage || '',
        lastMessage: messageContent,
        messages: [],
        lastMessageAt: new Date(),
        unreadCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        // Find existing contact or create new one
        const existingContact = await LineContact.findOne({
          incomingLineId: event.source.userId,
          outgoingLineId: body.destination
        });

        if (existingContact) {
          // Fix any existing messages that don't have content
          if (existingContact.messages && existingContact.messages.length > 0) {
            for (let i = 0; i < existingContact.messages.length; i++) {
              if (!existingContact.messages[i].content) {
                existingContact.messages[i].content = 'Message content unavailable';
              }
            }
          }
          
          existingContact.lastMessage = messageContent;
          existingContact.lastMessageAt = new Date();
          existingContact.unreadCount += 1;
          existingContact.updatedAt = new Date();
          
          // Add message to contact with all required fields
          existingContact.messages.push({
            messageType: MessageType.INCOMING,
            content: messageContent, // Ensure content is always set
            createdAt: new Date(),
            contentType: contentType,
            imageUrl: imageUrl || undefined
          });
          
          await existingContact.save();
        } else {
          // Add first message with all required fields
          lineContact.messages.push({
            messageType: MessageType.INCOMING,
            content: messageContent, // Ensure content is always set
            createdAt: new Date(),
            contentType: contentType,
            imageUrl: imageUrl || undefined
          });
          
          await LineContact.create(lineContact);
        }
      } catch (error) {
        console.error('Error saving LINE contact:', error);
      }
    }

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
