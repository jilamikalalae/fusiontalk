import { MessageType } from '@/enum/enum';
import { DecryptString } from '@/lib/crypto';
import connectMongoDB from '@/lib/mongodb';
import { uploadToS3 } from '@/lib/s3';
import { ILineContact } from '@/domain/LineMessage';
import { LineContact } from '@/models/lineMessage';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    let messageData;
    let imageBuffer;
    let imageFileName;
    let imageUrl = '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with image
      const formData = await req.formData();
      messageData = {
        recipientId: formData.get('recipientId') || formData.get('incomingLineId'),
        content: formData.get('content') || 'Sent an image',
        contentType: 'image'
      };
      
      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NewResponse(400, null, 'No image file provided');
      }
      
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageFileName = `line/${messageData.recipientId}/${uuidv4()}.${imageFile.name.split('.').pop()}`;
      
      // Upload image to S3
      try {
        imageUrl = await uploadToS3(
          imageBuffer,
          imageFileName,
          'image/jpeg'
        );
        console.log('Successfully uploaded image to S3:', imageUrl);
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NewResponse(500, null, 'Failed to upload image');
      }
    } else {
      // Handle regular JSON message
      messageData = await req.json();
      
      // Support both parameter names
      if (messageData.incomingLineId && !messageData.recipientId) {
        messageData.recipientId = messageData.incomingLineId;
      }
      
      if (!messageData.content) {
        messageData.content = 'Empty message';
      }
    }
    
    await connectMongoDB();
    
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }
    
    const user = await User.findById(session.user.id);
    if (!user?.lineToken?.accessToken) {
      return NewResponse(409, null, 'User is not connected with LINE');
    }
    
    const accessToken = DecryptString(
      user.lineToken.accessToken,
      user.lineToken.accessTokenIv
    );
    
    // Validate recipientId
    if (!messageData.recipientId) {
      console.error('Missing recipientId in request:', messageData);
      return NewResponse(400, null, 'Recipient ID is required (send as recipientId or incomingLineId)');
    }
    
    console.log('Sending LINE message to:', messageData.recipientId);
    
    // Prepare LINE message
    let lineMessage;
    if (messageData.contentType === 'image' && imageUrl) {
      lineMessage = {
        type: 'image',
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl
      };
    } else {
      lineMessage = {
        type: 'text',
        text: messageData.content
      };
    }
    
    // Send message to LINE
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Line-Retry-Key': uuidv4()
      },
      body: JSON.stringify({
        to: messageData.recipientId,
        messages: [lineMessage]
      })
    });
    
    // Log the request body for debugging
    console.log('LINE API request body:', JSON.stringify({
      to: messageData.recipientId,
      messages: [lineMessage]
    }));
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API error:', JSON.stringify(errorData));
      return NewResponse(502, null, `LINE API error: ${JSON.stringify(errorData)}`);
    }
    
    // Update or create contact
    const existingContact = await LineContact.findOne({
      incomingLineId: messageData.recipientId,
      outgoingLineId: user.lineToken.userId
    });
    
    const messageContent = messageData.contentType === 'image' ? 'Sent an image' : messageData.content;
    
    if (existingContact) {
      existingContact.lastMessage = messageContent;
      existingContact.lastMessageAt = new Date();
      existingContact.updatedAt = new Date();
      existingContact.messages.push({
        messageType: MessageType.OUTGOING,
        content: messageContent || 'Message content unavailable', // Provide a fallback
        createdAt: new Date(),
        contentType: messageData.contentType || 'text',
        imageUrl: imageUrl || undefined
      });
      
      // Before saving, ensure all messages have content
      if (existingContact.messages) {
        for (let i = 0; i < existingContact.messages.length; i++) {
          if (!existingContact.messages[i].content) {
            existingContact.messages[i].content = 'Message content unavailable';
          }
        }
      }
      
      await existingContact.save();
    } else {
      console.error('Contact not found:', messageData.recipientId);
      return NewResponse(404, null, 'Contact not found');
    }
    
    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
