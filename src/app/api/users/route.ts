import { NextRequest, NextResponse } from "next/server";
import {NextApiResponse } from 'next';
import { AuthOptions, getServerSession } from "next-auth";
import authOptions from '@/lib/authOptions';

export async function GET(req: NextRequest, res: NextResponse) {
    const session = await getServerSession(authOptions as AuthOptions);
    if(!session){
        return NextResponse.json({ status: 401});
    }
    const id = session?.user.id;

    

    return  NextResponse.json({ status: 200 });
}