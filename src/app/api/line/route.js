import { NextResponse } from 'next/server';
import { storeLineMessage, upsertLineContact } from '@/lib/db';
import { connectMongoDB } from '@/lib/mongodb';
import { Server } from 'socket.io';

let io; // Keep the Socket.IO server instance in memory

// Initialize Socket.IO server if not already initialized
function initializeSocket(server) {
  if (!io) {
    io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
  }
  return io;
}

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
  try {
    const body = await req.json();
    console.log('Received LINE webhook:', JSON.stringify(body, null, 2));

    // Handle LINE platform webhook events (messages from LINE app)
    if (body.events && Array.isArray(body.events)) {
      for (const event of body.events) {
        if (event.type === 'message' && event.message.type === 'text') {
          const userId = event.source.userId;
          const messageText = event.message.text;

          try {
            // Store the incoming LINE message
            const messageData = {
              userId: userId,
              userName: 'LINE User', // You can fetch actual name if needed
              content: messageText,
              messageType: 'user',
              createdAt: new Date().toISOString(),
              replyTo: 'BOT'
            };

            await storeLineMessage(messageData);

            // Emit to all connected clients for this user
            if (io) {
              console.log('Emitting LINE message to socket room:', userId);
              io.emit('receive_message', messageData); // Changed to broadcast to all
            }

            return NextResponse.json({ success: true });
          } catch (error) {
            console.error('Error processing LINE message:', error);
            throw error;
          }
        }
      }
    }

    // Handle messages sent from your web app
    if (body.userId && body.message) {
      try {
        // Store the bot message
        await storeLineMessage({
          userId: body.userId,
          userName: body.userName || 'Bot',
          content: body.message,
          messageType: body.messageType || 'bot',
          replyTo: body.replyTo,
          createdAt: new Date().toISOString()
        });

        // Push message to LINE
        if (body.userId === 'BOT') {
          await pushMessageToUser(body.replyTo, body.message);
        }

        // Emit socket event
        if (io) {
          console.log('Emitting bot message to socket room:', body.replyTo);
          io.emit('receive_message', {
            userId: body.userId,
            userName: body.userName || 'Bot',
            content: body.message,
            messageType: body.messageType || 'bot',
            createdAt: new Date().toISOString(),
            replyTo: body.replyTo
          });
        }

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error processing bot message:', error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in LINE webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
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
