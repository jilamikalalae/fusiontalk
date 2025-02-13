import { NextResponse } from 'next/server';
import { getMessengerMessages, storeMessengerMessage } from '@/lib/db';

export async function POST(req: Request) {
    try {
      const messageData = await req.json();
      const savedMessage = await storeMessengerMessage(messageData);
      return NextResponse.json(savedMessage);
    } catch (error) {
      console.error('Error storing message:', error);
      return NextResponse.json(
        { error: 'Failed to store message' },
        { status: 500 }
      );
    }
  }
  
export async function GET() {
  try {
    const messages = await getMessengerMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}