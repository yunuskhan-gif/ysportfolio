import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { getChatMessageModel } from "@/lib/models/ChatMessage";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_auth_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.user as string) || "main";
  } catch {
    return null;
  }
}

// GET: Fetch recent messages (up to 100)
export async function GET() {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const ChatModel = getChatMessageModel();
    const messages = await ChatModel.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Reverse so oldest of the latest 100 is first
    const formatted = messages.reverse().map((msg: any) => ({
      id: msg._id.toString(),
      sender: msg.sender,
      message: msg.message,
      avatarColor: msg.avatarColor || "#2563eb",
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({ messages: formatted, currentUser });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST: Send new message
export async function POST(req: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 });
    }

    await connectToDatabase();
    const ChatModel = getChatMessageModel();

    const newMsg = await ChatModel.create({
      sender: currentUser,
      message,
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg._id.toString(),
        sender: newMsg.sender,
        message: newMsg.message,
        avatarColor: newMsg.avatarColor || "#2563eb",
        createdAt: newMsg.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error saving chat message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

