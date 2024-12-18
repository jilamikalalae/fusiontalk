import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import { AuthOptions, getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, secretToken } = await req.json();

    if (!accessToken || !secretToken) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NextResponse.json({ status: 401 });
    }
    const id = session?.user.id;

    await connectMongoDB();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const hashedSecretToken = await bcrypt.hash(secretToken, 10);

    // Update user tokens
    let lineToken = {} as any;
    lineToken.accessToken = hashedAccessToken;
    lineToken.secretToken = hashedSecretToken;
    existingUser.lineToken = lineToken;
    await existingUser.save();

    return NextResponse.json(
      { message: 'Line account connected successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NextResponse.json(
      { message: 'Failed to connect Line account. Please try again later.' },
      { status: 500 }
    );
  }
}
