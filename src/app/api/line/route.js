import { NextResponse } from 'next/server';
// import { storeLineMessage, upsertLineContact } from '@/lib/db';
import connectMongoDB from '@/lib/mongodb';
import User from '@/models/user';
import { DecryptString } from '@/lib/crypto';

// 🛠 Securely Fetch and Decrypt User's LINE Token
async function getUserLineCredentials(userId) {
  await connectMongoDB();

  const users = await User.find({});
  let foundUser = null;

  for (const user of users) {
    if (!user.lineToken || !user.lineToken.userIdIv) continue;

    try {
      const decryptedUserId = DecryptString(
        user.lineToken.userId,
        user.lineToken.userIdIv
      );
      if (decryptedUserId === userId) {
        foundUser = user;
        break;
      }
    } catch (error) {
      console.error(`Error decrypting userId: ${error.message}`);
    }
  }

  if (!foundUser) {
    throw new Error(`No user found for LINE ID: ${userId}`);
  }

  const { lineToken } = foundUser;

  // Ensure IVs exist before decrypting
  if (!lineToken.accessTokenIv || !lineToken.accessToken) {
    throw new Error(`Missing Access Token or IV for user ${userId}`);
  }

  const LineAccessToken = DecryptString(
    lineToken.accessToken,
    lineToken.accessTokenIv
  );

  return { LineAccessToken };
}

// 🛠 Fetch User Profile Using LINE API
async function getLineUserProfile(userId) {
  const { LineAccessToken } = await getUserLineCredentials(userId);

  const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get user profile: ${response.statusText} (${errorText})`
    );
  }

  return await response.json();
}

// 🛠 Send Message to User
async function pushMessageToUser(userId, message) {
  const LINE_API_URL = 'https://api.line.me/v2/bot/message/push';
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
  };
  const body = JSON.stringify({
    to: userId,
    messages: Array.isArray(message)
      ? message
      : [{ type: 'text', text: message }]
  });

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers,
    body
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
    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
  };
  const body = JSON.stringify({
    replyToken,
    messages: [{ type: 'text', text: message }]
  });

  const response = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers,
    body
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`LINE API error: ${response.status} ${errorData}`);
  }

  return response.json();
}

// 🛠 Webhook Handler
export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers });
  }

  try {
    const body = await req.json();
    console.log('Received webhook body:', JSON.stringify(body, null, 2));

    await connectMongoDB();

    // Handle Direct Messages
    if (body.message && body.userId) {
      const { message, userId } = body;

      try {
        const userProfile = await getLineUserProfile(userId);

        // Push the message to the user
        await pushMessageToUser(userId, message);

        // Store bot reply
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

    // Validate Webhook Format
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'Invalid webhook format' },
        { status: 400, headers }
      );
    }

    // Process LINE Webhook Events
    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        const userId = event.source.userId;

        try {
          const userProfile = await getLineUserProfile(userId);
          await upsertLineContact({
            userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            statusMessage: userProfile.statusMessage
          });

          // Store user message
          await storeLineMessage({
            userId,
            userName: userProfile.displayName,
            content: userMessage,
            messageType: 'user',
            createdAt: new Date().toISOString()
          });

          // Generate and store bot reply
          // const botReply =
          //   userMessage.toLowerCase().trim() === 'hello'
          //     ? 'Hello! How can I assist you today?'
          //     : `${userMessage}`;

          // await storeLineMessage({
          //   userId: 'BOT',
          //   userName: 'Bot',
          //   content: botReply,
          //   messageType: 'bot',
          //   replyTo: userId,
          //   createdAt: new Date().toISOString()
          // });
          // await sendLineMessage(event.replyToken, botReply);
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

// 🛠 CORS Preflight Handler
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
