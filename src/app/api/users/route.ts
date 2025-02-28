import { NextRequest, NextResponse } from 'next/server';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/user';
import { NewResponse } from '@/types/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const id = session?.user.id;

    await connectMongoDB();

    const user = await User.findById(id);

    if (!user) {
      return NewResponse(404, null, 'User not found');
    }

    let isLineConnected =
      user.lineToken.accessToken && user.lineToken.secretToken != null;

    const userProfile: UserProfile = {
      name: user.name,
      email: user.email,
      isLineConnected: isLineConnected,
      isMessengerConnected: false
    };

    return NewResponse(200, userProfile, null);
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NewResponse(
      500,
      null,
      'Failed to connect Line account. Please try again later.'
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NewResponse(400, null, 'All fields can not be empty.');
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, null);
    }

    const id = session?.user.id;

    await connectMongoDB();

    await User.findByIdAndUpdate(id, { name, email });

    return NewResponse(200, null, 'Line account connected successfully.');
  } catch (error) {
    console.error('Error to update name and email:', error);
    return NewResponse(
      500,
      null,
      'Failed to update name and Please try again later.'
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }

    const id = session?.user.id;

    await connectMongoDB();

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NewResponse(404, null, 'User not found');
    }

    return NewResponse(200, null, 'Account deleted successfully');
  } catch (error) {
    console.error('Error deleting account:', error);
    return NewResponse(
      500,
      null,
      'Failed to delete account. Please try again later.'
    );
  }
}
