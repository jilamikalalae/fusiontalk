import { NextResponse } from 'next/server';
import { getLineMessages } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get userId from query params if provided
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const messages = await getLineMessages(userId || undefined);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 