import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../models/user";
import bcrypt from "bcryptjs";


export async function POST(req) {
  try {
    const { accessToken, secretToken } = await req.json();

    if (!accessToken || !secretToken ) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    await connectMongoDB();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ secretToken: hashedPassword,accessToken: hashedPassword });

    return NextResponse.json(
      { message: "User connect line successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error.message);
    return NextResponse.json(
      { message: "Failed to connect line. Please try again later." },
      { status: 500 }
    );
  }
}
