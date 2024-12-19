import { NextResponse } from 'next/server';
import { storeLineMessage, upsertLineContact } from '@/lib/db';
import { connectMongoDB } from '@/lib/mongodb';

async function getLineUserProfile(userId) {
  await connectMongoDB();

  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN is not configured');
  }

  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.statusText}`);
  }

  return await response.json();
}

export async function POST(req) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    if (!req.body) {
      console.error('No request body');
      return NextResponse.json({ error: 'No request body' }, { status: 400, headers });
    }

    const body = await req.json();
    console.log('Received webhook body:', JSON.stringify(body, null, 2));

    if (!body.events || !Array.isArray(body.events)) {
      console.error('Invalid webhook format:', body);
      return NextResponse.json({ error: 'Invalid webhook format' }, { status: 400, headers });
    }

    for (const event of body.events) {
      try {
        if (event.type === 'message' && event.message.type === 'text') {
          const userMessage = event.message.text;
          const userId = event.source.userId;

          // Fetch and store user profile
          try {
            const userProfile = await getLineUserProfile(userId);
            console.log(userProfile)
            await upsertLineContact({
              userId,
              displayName: userProfile.displayName,
              pictureUrl: userProfile.pictureUrl,
              statusMessage: userProfile.statusMessage
            });


            // Store the user message
            await storeLineMessage(
              userId,
              userProfile.displayName,
              userMessage,
              'user'
            );


          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
          }

          // Generate bot reply
          const lowerCaseMessage = userMessage.toLowerCase().trim();
          let botReply;

          if (lowerCaseMessage === 'hello' || lowerCaseMessage === 'hi') {
            botReply = "Hello! How can I assist you today?";
          } else {
            botReply = `I received your message: "${userMessage}". How can I help you?`;
          }

          // Store bot reply
          await storeLineMessage(
            'BOT',
            'Bot',
            botReply,
            'bot'
          );

          // Add error handling and logging for LINE API call
          try {
            console.log('Sending LINE message:', { replyToken: event.replyToken, botReply });
            const response = await sendLineMessage(event.replyToken, botReply);
            console.log('LINE API response:', response.status);
          } catch (error) {
            console.error('Error sending LINE message:', error);
            throw error; // Re-throw to be caught by the outer try-catch
          }
        }
      } catch (eventError) {
        console.error('Error processing event:', eventError);
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

async function sendLineMessage(replyToken, message) {
  const LINE_API_URL = 'https://api.line.me/v2/bot/message/reply';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
  };
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: 'text', text: message }]
  });

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers,
    body
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorData}`);
  }

  return response;
}

async function sendMessageToUser(userId, message) {
  // Fetch user profile to get replyToken or use a predefined replyToken
  const userProfile = await getLineUserProfile(userId);
  const replyToken = userProfile.replyToken; // Assuming you have a way to get replyToken

  // Send message to user
  await sendLineMessage(replyToken, message);
}

async function pushMessageToUser(userId, message) {
  const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
  };
  const body = JSON.stringify({
    to: userId,
    messages: [{ type: 'text', text: message }]
  });

  const response = await fetch(LINE_API_URL, {
    method: 'POST',
    headers,
    body
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorData}`);
  }

  return response;
}

// Make sure OPTIONS method is handled
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
