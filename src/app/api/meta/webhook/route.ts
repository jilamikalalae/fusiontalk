import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.VERIFY_TOKEN;

// API FOR VERIFY WEBHOOK API
export async function GET(req: NextRequest) {
    const challenge = req.nextUrl?.searchParams.get('hub.challenge')
    return new Response(challenge)
}

// WEBHOOK Tutorial
export async function POST(req: any) {
    const body = await req.json(); 
    const messaging = body.entry?.[0]?.messaging;
    const senderId = messaging[0].sender.id
    
    console.log('Message Info: ',messaging)

    const getProfileUrl = `https://graph.facebook.com/${senderId}?fields=first_name,last_name,profile_pic&access_token=${ACCESS_TOKEN}`;

    const response = await fetch(getProfileUrl);
    const data = await response.json();

    console.log('Sender Profile',data);

    return NextResponse.json(req)
}
