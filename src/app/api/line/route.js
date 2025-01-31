import { NextResponse } from 'next/server';
import { storeLineMessage, upsertLineContact } from '@/lib/db';
import { connectMongoDB } from '@/lib/mongodb';

// Fetch user profile using LINE Messaging API
async function getLineUserProfile(userId) {
  await connectMongoDB();

  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get user profile: ${response.statusText} (${errorText})`);
  }

  return await response.json();
}

// Push message directly to a user
async function pushMessageToUser(userId, message) {
  const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
  };
  const body = JSON.stringify({
    to: userId,
    messages: Array.isArray(message) ? message : [{ type: 'text', text: message }],
  });

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorData}`);
  }

  return response.json(); // Return the response body for further processing
}

// Reply to a message using replyToken
async function sendLineMessage(replyToken, message) {
  const LINE_API_URL = 'https://api.line.me/v2/bot/message/reply';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
  };
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: 'text', text: message }],
  });

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorData}`);
  }

  return response.json(); // Return the response body
}

// Webhook handler
export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const body = await req.json();
    console.log('Received webhook body:', JSON.stringify(body, null, 2));

    if (body.userId && body.message) {
      // Direct message to a user
      const { userId, message } = body;

      try {
        // Fetch user profile
        const userProfile = await getLineUserProfile(userId);
        
        // Push the message to the user
        await pushMessageToUser(userId, message);

        // Store ONLY the bot message
        await storeLineMessage({
          userId: 'BOT',
          userName: 'Bot',
          content: message,
          messageType: 'bot',
          replyTo: userId,
          createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true }, { headers });
      } catch (error) {
        console.error('Error sending direct message:', error);
        return NextResponse.json(
          { error: 'Failed to send message', details: error.message },
          { status: 500, headers }
        );
      }
    }

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400, headers });
    }

    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        const userId = event.source.userId;

        try {
          // Fetch user profile
          const userProfile = await getLineUserProfile(userId);
          await upsertLineContact({
            userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            statusMessage: userProfile.statusMessage,
          });

          // Store user message
          await storeLineMessage({
            userId: userId,
            userName: userProfile.displayName,
            content: userMessage,
            messageType: 'user',
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error processing event:', error);
        }
      }
    }

    return NextResponse.json({ status: 'ok' }, { headers });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers }
    );
  }
}

// CORS preflight handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
