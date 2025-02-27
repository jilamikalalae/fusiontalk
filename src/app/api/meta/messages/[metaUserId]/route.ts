import { IUser } from '@/domain/User';
import authOptions from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import MessengerMessage from '@/models/messengerMessage';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';
import { AuthOptions, getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ metaUserId: string }> }
) {
  try {
    const { metaUserId } = await params;

    await connectMongoDB();

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const user: IUser | null = await User.findById(session.user.id);

    if (!user?.messengerToken?.accessToken || !user?.messengerToken?.pageId) {
      return NewResponse(409, null, 'user is not connect with meta.');
    }

    const query = metaUserId
      ? {
          $or: [
            { senderId: metaUserId, recipientId: user.messengerToken.pageId },
            { senderId: user.messengerToken.pageId, recipientId: metaUserId }
          ]
        }
      : {};

    const messages = await MessengerMessage.find(query)
      .sort({ timestamp: -1 })
      .lean();

    return NewResponse(200, messages, null);
  } catch (e: any) {
    console.log('failed to get message by meta user id, err:', e.message);
    return NewResponse(500, null, e.message);
  }
}
