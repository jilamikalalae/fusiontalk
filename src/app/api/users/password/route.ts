import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { NewResponse } from '@/types/api-response';

type UpdatePasswordRequest = {
  password: string;
  newPassword: string;
  checkPassword: string;
};

export async function PUT(req: NextRequest) {
  try {
    const request: UpdatePasswordRequest = await req.json();

    if (!request.password || !request.newPassword || !request.checkPassword) {
      return NewResponse(400, null, 'All fields are required.');
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    await connectMongoDB();
    const id = session.user.id;
    const user = await User.findById(id);

    // const hashedPassword = await bcrypt.hash(request.password, 10);
    // const hashedNewPassword = await bcrypt.hash(request.checkPassword, 10);

    // Check if the current password is correct
    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password
    );

    if (!isPasswordValid) {
      return NewResponse(400, null, 'Current password is incorrect.');
    }
    // Check if new passwords match
    if (request.newPassword !== request.checkPassword) {
      return NewResponse(400, null, "New passwords don't match.");
    }

    // Hash the new password and update it
    const hashedNewPassword = await bcrypt.hash(request.newPassword, 10);
    await User.findByIdAndUpdate(id, { password: hashedNewPassword });

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NewResponse(
      500,
      null,
      'Failed to connect Line account. Please try again later.'
    );
  }
}
