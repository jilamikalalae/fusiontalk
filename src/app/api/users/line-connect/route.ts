import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import bcrypt from 'bcryptjs';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NewResponse } from '@/types/api-response';
import { EncryptString } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, secretToken, userId } = await req.json();

    if (!accessToken || !secretToken || !userId) {
      return NewResponse(400, null, 'All fields are required.');
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, null);
    }
    const id = session?.user.id;

    await connectMongoDB();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NewResponse(404, null, null);
    }

    const encryptAccessToken = EncryptString(accessToken)
    const encryptSecretToken = EncryptString(secretToken)
    const encryptUserId = EncryptString(userId)

    // Update user tokens
    let lineToken = {} as any;
    lineToken.accessToken = encryptAccessToken.encrypted;
    lineToken.accessTokenIv = encryptAccessToken.iv;
    lineToken.secretToken = encryptSecretToken.encrypted;
    lineToken.secretTokenIv = encryptSecretToken.iv;
    lineToken.userId = encryptUserId.encrypted;
    lineToken.userIdIv = encryptUserId.iv;
    existingUser.lineToken = lineToken;
    console.log(existingUser)

    await existingUser.save();
    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NewResponse(200, null, null);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401, null, 'Unauthorized');
    }
    const id = session?.user.id;

    await connectMongoDB();

    const user = await User.findByIdAndUpdate(id, { lineToken : null});

    return NewResponse(200, null, null);
  } catch (error) {
    console.error('Error delete line token:', error);
    return NewResponse(500,null,'Failed to delete line token Please try again later.' )
  }
}
