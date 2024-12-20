import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { connectMongoDB } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

type UpdatePasswordRequest = {
  password: string;
  newPassword: string;
  checkPassword: string;
};

export async function PUT(req: NextRequest) {
  try {
    const request: UpdatePasswordRequest = await req.json();

    if (!request.password || !request.newPassword || !request.checkPassword) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NextResponse.json({ status: 401 });
    }

    await connectMongoDB();
    const id = session.user.id;
    const user = await User.findById(id);

    const hashedPassword = await bcrypt.hash(request.password, 10);
    const hashedNewPassword = await bcrypt.hash(request.checkPassword, 10);

    if (hashedPassword == user.password) {
      if (request.newPassword == request.checkPassword) {
        await User.findByIdAndUpdate(id, { password: hashedNewPassword });
      }
    }
    return NextResponse.json(
      { message: 'Changed password successfully.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NextResponse.json(
      { message: 'Failed to connect Line account. Please try again later.' },
      { status: 500 }
    );
  }
}
