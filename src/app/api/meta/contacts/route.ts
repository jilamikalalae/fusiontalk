import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import messengerContact from '@/models/messengerContact';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NewResponse } from '@/types/api-response';
import { getMessengerContacts } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const contacts = await getMessengerContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
