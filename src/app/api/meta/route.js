// src/app/api/meta/route.js

import { NextResponse } from "next/server";

const ACCESS_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ID = 521016351095792;

export async function GET() {
  const url = `https://graph.facebook.com/v22.0/${PAGE_ID}/conversations?fields=participants,messages{id,message}&access_token=${ACCESS_TOKEN}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: "Error fetching conversations" }, { status: 500 });
  }
  
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { recipientId, messageText } = req.body;

    if (!recipientId || !messageText) {
      return res.status(400).json({ error: 'Missing recipientId or messageText' });
    }

    const url = `https://graph.facebook.com/v22.0/${PAGE_ID}/messages?access_token=${ACCESS_TOKEN}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          messaging_type: 'RESPONSE',
          message: { text: messageText },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ error: data.error });
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}