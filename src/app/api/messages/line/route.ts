import { NextResponse } from 'next/server';
import LineMessage from '@/models/lineMessage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  try {
    const query = userId ? { userId } : {};
    const messages = await LineMessage.find(query).sort({ 'messages.createdAt': -1 });
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, userName, content, messageType, replyTo } = await request.json();
    const result = await LineMessage.addMessage(userId, userName, content, messageType, replyTo);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 