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

export async function POST(request) {
  // Handle the webhook callback logic
  try {
    const body = await request.json();
    console.log("Webhook received:", body);

    return NextResponse.json({ status: "Webhook received successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error processing webhook" }, { status: 500 });
  }
}
