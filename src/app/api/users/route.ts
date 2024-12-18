import { NextRequest, NextResponse } from "next/server";
import {NextApiResponse } from 'next';
import { AuthOptions, getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest, res: NextApiResponse) {
    const session = await getServerSession(authOptions as AuthOptions);
    if(!session){
        return NextResponse.json({ status: 401});
    }
}