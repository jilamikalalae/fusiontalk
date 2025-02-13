// src/app/api/meta/route.js

import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ID = 521016351095792;

// export async function GET() {
//   const url = `https://graph.facebook.com/v22.0/${PAGE_ID}/conversations?fields=participants,messages{id,message}&access_token=${ACCESS_TOKEN}`;
//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     console.log(data);
//     return NextResponse.json(data);

//   } catch (error) {
//     return NextResponse.json({ error: "Error fetching conversations" }, { status: 500 });
//   }
  
// }

export async function POST(req) {
  const body = await req.json();
  const { recipientId, messageText } = body;

  if (!recipientId || !messageText) {
    return new Response(
      JSON.stringify({ error: 'Missing recipientId or messageText' }), 
      { status: 400 }
    );
  }

  try {
    // Log the request details
    console.log('Sending message to Facebook:', {
      recipientId,
      messageText,
      accessTokenLength: ACCESS_TOKEN?.length || 0
    });

    const requestBody = {
      messaging_type: "RESPONSE",  // Add messaging type
      recipient: { id: recipientId },
      message: { text: messageText }
    };

    // Log the full request
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    // Log the full response
    console.log('Facebook API full response:', data);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: data.error,
          requestBody: requestBody,  // Include request body in error response
          statusCode: response.status
        }), 
        { status: response.status }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }), 
      { status: 500 }
    );
  }
}