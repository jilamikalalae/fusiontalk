import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = session?.user.id;

    await connectMongoDB();

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isLineConnected =
      user.lineToken.accessToken && user.lineToken.secretToken != null;

    const userProfile: UserProfile = {
      name: user.name,
      email: user.email,
      isLineConnected: isLineConnected,
      isMessengerConnected: false
    };

    return NextResponse.json(userProfile, { status: 200 });
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NextResponse.json(
      { message: 'Failed to connect Line account. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { message: 'All fields can not be empty.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NextResponse.json({ status: 401 });
    }

    const id = session?.user.id;

    await connectMongoDB();

    await User.findByIdAndUpdate(id, { name, email });

    return NextResponse.json(
        { message: 'Line account connected successfully.' },
        { status: 200 }
      );

  } catch (error) {
    console.error('Error to update name and email:', error);
    return NextResponse.json(
      { message: 'Failed to update name and Please try again later.' },
      { status: 500 }
    );
  }
}
