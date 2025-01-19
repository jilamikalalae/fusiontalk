import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import LineMessage from '@/models/lineMessage';

// Fetch user profile using LINE Messaging API
async function getLineUserProfile(userId) {
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

  return response.json();
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

  return response.json();
}

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
    await connectMongoDB();
    const body = await req.json();
    console.log('Received webhook body:', JSON.stringify(body, null, 2));

    // Handle direct messages from frontend (bot sending message)
    if (body.userId && body.message && !body.events) {
      try {
        // Send message to LINE user
        await pushMessageToUser(body.userId, body.message);
        
        // Save only as bot message
        await LineMessage.addMessage(
          body.userId,
          'Bot',
          body.message,
          'bot'
        );

        return NextResponse.json({ success: true }, { headers });
      } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to process message' },
          { status: 500, headers }
        );
      }
    }

    // Handle LINE webhook events (user messages)
    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        if (event.type === 'message' && event.message.type === 'text') {
          const userMessage = event.message.text;
          const userId = event.source.userId;

          // Get user profile
          const userProfile = await getLineUserProfile(userId);

          // Save user message
          await LineMessage.addMessage(
            userId,
            userProfile.displayName,
            userMessage,
            'user'
          );

          // Send and save bot response
          const botReply = `I received: "${userMessage}"`;
          await sendLineMessage(event.replyToken, botReply);
          await LineMessage.addMessage(
            userId,
            'Bot',
            botReply,
            'bot'
          );
        }
      }
      return NextResponse.json({ status: 'ok' }, { headers });
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400, headers });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
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