import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../models/user';
import bcrypt from 'bcryptjs';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { NewResponse } from '@/types/api-response';

export async function POST(req: NextRequest) {
  try {
    const { accessToken, secretToken } = await req.json();

    if (!accessToken || !secretToken) {
      return NewResponse(400,null,'All fields are required.')
    }

    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
      return NewResponse(401,null,null)
    }
    const id = session?.user.id;

    await connectMongoDB();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NewResponse(404,null,null)
    }

    const hashedAccessToken = await bcrypt.hash(accessToken, 10);
    const hashedSecretToken = await bcrypt.hash(secretToken, 10);

    // Update user tokens
    let lineToken = {} as any;
    lineToken.accessToken = hashedAccessToken;
    lineToken.secretToken = hashedSecretToken;
    existingUser.lineToken = lineToken;
    console.log(existingUser)
    await existingUser.save();

    return NewResponse(200,null,null);
  } catch (error) {
    console.error('Error connecting Line account:', error);
    return NewResponse(200,null,null);
  }
}
