import { MessageType } from '@/enum/enum';
import { DecryptString } from '@/lib/crypto';
import connectMongoDB from '@/lib/mongodb';
import { uploadToS3 } from '@/lib/s3';
import { LineContact } from '@/models/lineMessage';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

export interface LineMessageRequest {
  recipientId?: string;
  incomingLineId?: string;
  content?: string;
  contentType?: 'text' | 'image';
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let messageData: LineMessageRequest;
    let imageBuffer;
    let imageFileName;
    let imageUrl = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      messageData = {
        recipientId:
          formData.get('recipientId')?.toString() ||
          formData.get('incomingLineId')?.toString(),
        content: formData.get('content')?.toString() || 'Sent an image',
        contentType: 'image'
      };

      const imageFile = formData.get('image') as File;
      if (!imageFile) {
        return NewResponse(400, null, 'No image file provided');
      }

      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      imageFileName = `line/${messageData.recipientId}/${uuidv4()}.${imageFile.name.split('.').pop()}`;

      try {
        imageUrl = await uploadToS3(imageBuffer, imageFileName, 'image/jpeg');
        console.log('Successfully uploaded image to S3:', imageUrl);
      } catch (error) {
        console.error('Error uploading image to S3:', error);
        return NewResponse(500, null, 'Failed to upload image');
      }
    } else {
      messageData = await req.json();
      messageData.recipientId;
      messageData.content ||= 'Empty message';
    }

    await connectMongoDB();
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) return NewResponse(401, null, 'Unauthorized');

    const user = await User.findById(session.user.id);
    if (!user?.lineToken?.accessToken)
      return NewResponse(409, null, 'User is not connected with LINE');

    const accessToken = DecryptString(
      user.lineToken.accessToken,
      user.lineToken.accessTokenIv
    );
    if (!messageData.recipientId)
      return NewResponse(400, null, 'Recipient ID is required');

    console.log('Sending LINE message to:', messageData.recipientId);

    const lineMessage =
      messageData.contentType === 'image' && imageUrl
        ? {
            type: 'image',
            originalContentUrl: imageUrl,
            previewImageUrl: imageUrl
          }
        : { type: 'text', text: messageData.content };

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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE API error:', JSON.stringify(errorData));
      return NewResponse(
        502,
        null,
        `LINE API error: ${JSON.stringify(errorData)}`
      );
    }

    const existingContact = await LineContact.findOneAndUpdate(
      {
        incomingLineId: messageData.recipientId,
        outgoingLineId: user.lineToken.userId
      },
      {
        lastMessage:
          messageData.contentType === 'image'
            ? 'Sent an image'
            : messageData.content,
        lastMessageAt: new Date(),
        updatedAt: new Date(),
        $push: {
          messages: {
            messageType: MessageType.OUTGOING,
            content: messageData.content || 'Message content unavailable',
            createdAt: new Date(),
            contentType: messageData.contentType || 'text',
            imageUrl: imageUrl || undefined
          }
        }
      },
      { new: true, upsert: true }
    );

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error sending LINE message:', error);
    return NewResponse(500, null, 'Internal server error');
  }
}
