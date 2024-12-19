import { NextResponse } from 'next/server';
import { getLineContacts } from '@/lib/db';

export async function GET() {
  try {
    const contacts = await getLineContacts();
    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
} 