import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import { LineContact } from '@/models/lineMessage';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ lineUserId: string }> }
) {
  try {
    const { lineUserId } = await context.params;
    
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    await connectMongoDB();
    
    const user = await User.findById(session.user.id);
    if (!user?.lineToken?.userId) {
      return NewResponse(409, null, 'User has not connected with Line yet');
    }

    // Update the unread count to zero
    const result = await LineContact.findOneAndUpdate(
      {
        incomingLineId: lineUserId,
        outgoingLineId: user.lineToken.userId
      },
      { $set: { unreadCount: 0 } },
      { new: true }
    );

    if (!result) {
      return NewResponse(404, null, 'Line contact not found');
    }

    return NewResponse(200, { success: true }, null);
  } catch (error: any) {
    console.error('Error resetting unread count:', error);
    return NewResponse(500, null, error.message);
  }
} 