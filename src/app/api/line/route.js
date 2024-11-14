import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();

  // Check if we have events in the request body
  if (body.events && body.events.length > 0) {
    for (const event of body.events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        
        // Respond based on the user message
        let botReply;
        if (userMessage.toLowerCase() === 'hello') {
          botReply = "Hello! How can I assist you today?";
        } else {
          botReply = `You said: ${userMessage}`;
        }

        // Send a reply back to the user
        await sendLineMessage(event.replyToken, botReply);
      }
    }
  }

  return NextResponse.json({ status: 'ok' });
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

  await fetch(LINE_API_URL, {
    method: 'POST',
    headers,
    body
  });
}
