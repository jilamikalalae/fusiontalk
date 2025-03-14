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
      // Skip non-message events
      if (event.type !== 'message') {
        console.log(`Skipping non-message event: ${event.type}`);
        continue;
      }

      // Skip events without required fields
      if (!event.source?.userId || !event.message || !body.destination) {
        console.error('Missing required fields in event:', event);
        continue;
      }

      let messageContent = '';
      let contentType: ContentType = 'text';
      let imageUrl = '';

      // Handle different message types
      if (event.message.type === 'text') {
        messageContent = event.message.text;
      } else if (event.message.type === 'image') {
        messageContent = 'Sent an image';
        contentType = 'image';
        
        // Handle image upload if needed
        // This is a placeholder - implement actual image handling logic
        imageUrl = `https://example.com/placeholder-image-${uuidv4()}.jpg`;
      } else {
        messageContent = `Sent a ${event.message.type}`;
      }

      // Create a basic LINE contact object
      const lineContact = {
        incomingLineId: event.source.userId,
        outgoingLineId: body.destination,
        displayName: 'LINE User', // Will be updated when profile is fetched
        profileUrl: 'https://profile.line-scdn.net/0m00000000000000000000000000000000000000000000', // Default
        statusMessage: '',
        lastMessage: messageContent,
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
          // Update existing contact
          existingContact.lastMessage = messageContent;
          existingContact.lastMessageAt = new Date();
          existingContact.unreadCount += 1;
          existingContact.updatedAt = new Date();
          
          // Add message to contact
          existingContact.messages.push({
            messageType: MessageType.INCOMING,
            content: messageContent,
            createdAt: new Date(),
            contentType: contentType,
            imageUrl: imageUrl
          });
          
          await existingContact.save();
          console.log('Updated existing LINE contact');
        } else {
          // Create new contact with first message
          const newContact = new LineContact(lineContact);
          newContact.messages.push({
            messageType: MessageType.INCOMING,
            content: messageContent,
            createdAt: new Date(),
            contentType: contentType,
            imageUrl: imageUrl
          });
          
          await newContact.save();
          console.log('Created new LINE contact');
        }
      } catch (error) {
        console.error('Error saving LINE contact:', error);
      }
    }

    // LINE expects a 200 response to confirm receipt
    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error processing LINE webhook:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
