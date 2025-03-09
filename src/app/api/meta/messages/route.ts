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
import { uploadToS3 } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    // Check if it's a multipart form data (image upload) or JSON
    const contentType = req.headers.get('content-type') || '';
    
    let messageData;
    let imageBuffer;
    let imageFileName;
    let imageUrl = '';
    let requestBody;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with image
      const formData = await req.formData();
      messageData = {
        recipientId: formData.get('recipientId') || formData.get('userId'),
        content: formData.get('content') || 'Sent an image',
        contentType: 'image'
      };
      
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NewResponse(400, null, 'No image file provided');
      }
      
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageFileName = `messenger/${messageData.recipientId}/${v4()}.${imageFile.name.split('.').pop()}`;
    } else {
      // Handle regular JSON message
      messageData = await req.json();
      
      // Support multiple parameter names for recipient ID
      if (messageData.userId && !messageData.recipientId) {
        messageData.recipientId = messageData.userId;
      }
    }
    
    // Validate recipient ID
    if (!messageData.recipientId) {
      console.error('Missing recipientId in request:', messageData);
      return NewResponse(400, null, 'Recipient ID is required');
    }
    
    console.log('Sending Meta message to:', messageData.recipientId);
    
    await connectMongoDB();

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const user: IUser | null = await User.findById(session.user.id);

    if (!user?.messengerToken?.accessToken || !user?.messengerToken?.pageId) {
      return NewResponse(409, null, 'User is not connected with Meta.');
    }

    const accessToken = DecryptString(
      user.messengerToken.accessToken,
      user.messengerToken.accessTokenIv
    );
    
    // Check if the contact exists
    const messengerContact = await MessengerContact.findOne({
      pageId: user.messengerToken.pageId,
      userId: messageData.recipientId
    });
    
    if (!messengerContact) {
      console.error('Messenger contact not found:', messageData.recipientId);
      return NewResponse(404, null, 'Messenger contact not found');
    }
    
    if (messageData.contentType === 'image' && imageBuffer) {
      try {
        // Add null check before using imageFileName
        if (!imageFileName) {
          throw new Error('Image filename is required');
        }

        // Upload image to S3
        imageUrl = await uploadToS3(
          imageBuffer,
          imageFileName,
          'image/jpeg'
        );
        
        // Create message with image attachment for Facebook
        requestBody = {
          messaging_type: 'RESPONSE',
          recipient: { id: messageData.recipientId },
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl,
                is_reusable: true
              }
            }
          }
        };
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NewResponse(500, null, 'Failed to upload image to S3');
      }
    } else {
      // Regular text message
      requestBody = {
        messaging_type: 'RESPONSE',
        recipient: { id: messageData.recipientId },
        message: { text: messageData.content }
      };
    }

    console.log('Meta API request body:', JSON.stringify(requestBody));
    
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
      // Check for token expiration
      if (data.error && data.error.code === 190) {
        return NewResponse(401, null, 'Your Facebook access token has expired. Please reconnect your Meta account.');
      }
      
      // Check for user not found error
      if (data.error && data.error.code === 100 && data.error.error_subcode === 2018001) {
        return NewResponse(404, null, 'User not found on Facebook. They may have blocked your page or deleted their account.');
      }
      
      return NewResponse(502, null, data.error?.message || 'Unknown Facebook API error');
    }

    const newMessage: IMessengerMessage = {
      senderId: user.messengerToken.pageId,
      recipientId: messageData.recipientId,
      senderName: user.name,
      messageType: MessageType.OUTGOING,
      content: messageData.content,
      messageId: v4(),
      timestamp: new Date(),
      isRead: true,
      contentType: messageData.contentType || 'text',
      imageUrl: imageUrl || undefined
    };

    await MessengerMessage.create(newMessage);

    // Update the contact's last message
    messengerContact.lastMessage = messageData.contentType === 'image' ? 'Sent an image' : messageData.content;
    messengerContact.lastMessageAt = new Date();
    await messengerContact.save();

    return NewResponse(200, { messageId: newMessage.messageId }, null);
  } catch (error) {
    console.error('Error sending message:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
