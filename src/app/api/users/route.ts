import { NextRequest, NextResponse } from "next/server";
import { AuthOptions, getServerSession } from "next-auth";
import authOptions from '@/lib/authOptions';
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions as AuthOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = session?.user.id;

    await connectMongoDB();

    const user = await User.findById(id);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isLineConnected = user.lineToken.accessToken && user.lineToken.secretToken != null;

    const userProfile: UserProfile = {
        name: user.name,
        email: user.email,
        isLineConnected: isLineConnected,
        isMessengerConnected: false,
    };

    return NextResponse.json(userProfile, { status: 200 });
}