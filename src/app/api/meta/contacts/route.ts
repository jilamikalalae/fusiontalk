import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import messengerContact from '@/models/messengerContact';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NewResponse } from '@/types/api-response';
import { IMessengerContact } from '@/domain/MessengerContact';
import User from '@/models/user';
import MessengerContact from '@/models/messengerContact';
import { IUser } from '@/domain/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    await connectMongoDB();

    const user: IUser | null = await User.findById(session.user.id);

    if (!user?.messengerToken?.accessToken || !user?.messengerToken?.pageId) {
      return NewResponse(409, null, 'user is not connect with meta.');
    }

    const contacts: IMessengerContact[] = await MessengerContact.find({
      pageId: user.messengerToken.pageId
    }).sort({ lastInteraction: -1 });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
