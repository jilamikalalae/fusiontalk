import { storeMessengerMessage, upsertMessengerContact } from "@/lib/db";

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
    
    if (!messaging || !messaging[0]) {
        return NextResponse.json({ status: 'no message data' });
    }

    const senderId = messaging[0].sender.id;
    
    try {
        // Get user profile
        const getProfileUrl = `https://graph.facebook.com/${senderId}?fields=first_name,last_name,profile_pic&access_token=${ACCESS_TOKEN}`;
        const response = await fetch(getProfileUrl);
        const profile = await response.json();

        // Store contact information
        await upsertMessengerContact({
            userId: senderId,
            firstName: profile.first_name,
            lastName: profile.last_name,
            profilePic: profile.profile_pic,
        });

        // If there's a message, store it
        if (messaging[0].message) {
            await storeMessengerMessage({
                senderId: senderId,
                recipientId: messaging[0].recipient.id,
                senderName: `${profile.first_name} ${profile.last_name}`,
                messageType: 'user',
                content: messaging[0].message.text,
                messageId: messaging[0].message.mid,
                timestamp: new Date(messaging[0].timestamp),
            });
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
