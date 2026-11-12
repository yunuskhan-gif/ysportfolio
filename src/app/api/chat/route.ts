import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import { getChatMessageModel } from "@/lib/models/ChatMessage";
import {
  getAllUsers,
  touchUserPresence,
  getUserOnlineStatus,
} from "@/lib/models/User";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("app_auth_token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "ys_portfolio_jwt_secret_key_random_123_456"
    );
    const { payload } = await jwtVerify(token, secret);
    return (payload.user as string) || "main";
  } catch {
    return null;
  }
}

// GET: Fetch recent messages (up to 100) + all registered users with Online/Offline status
export async function GET() {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mark current user as online
    await touchUserPresence(currentUser);

    await connectToDatabase();
    const ChatModel = getChatMessageModel();
    const [messages, rawUsers] = await Promise.all([
      ChatModel.find({}).sort({ createdAt: -1 }).limit(100).lean(),
      getAllUsers(),
    ]);

    // Reverse so oldest of the latest 100 is first
    const formatted = messages.reverse().map((msg: any) => ({
      id: msg._id.toString(),
      sender: msg.sender,
      message: msg.message,
      avatarColor: msg.avatarColor || "#2563eb",
      createdAt: msg.createdAt,
    }));

    // Map safe user list for chat sidebar with online/offline status
    const users = rawUsers
      .map((u) => {
        const isCurrent = u.username.toLowerCase() === currentUser.toLowerCase();
        const status = isCurrent
          ? { isOnline: true, lastSeen: new Date().toISOString() }
          : getUserOnlineStatus(u.username, u.lastSeen);
        return {
          id: u.id,
          username: u.username,
          fullName:
            u.fullName ||
            (u.username === "main" ? "Main Admin" : u.username.split("@")[0]),
          avatarUrl: u.avatarUrl || "",
          isAdmin: u.username.toLowerCase() === "main",
          isOnline: status.isOnline,
          lastSeen: status.lastSeen,
        };
      })
      .sort((a, b) => {
        // Current user first, then Online users, then Admin, then alphabetical
        const aIsMe = a.username.toLowerCase() === currentUser.toLowerCase() ? 1 : 0;
        const bIsMe = b.username.toLowerCase() === currentUser.toLowerCase() ? 1 : 0;
        if (aIsMe !== bIsMe) return bIsMe - aIsMe;
        if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
        if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
        return a.fullName.localeCompare(b.fullName);
      });

    return NextResponse.json({
      messages: formatted,
      users,
      currentUser,
      isAdmin: currentUser.toLowerCase() === "main",
    });
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

// POST: Send new message or update presence (ping/offline)
export async function POST(req: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Presence heartbeat or offline beacon
    if (body.action === "ping" || body.action === "offline") {
      await touchUserPresence(currentUser, body.action === "offline");
      return NextResponse.json({ success: true });
    }

    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 });
    }

    await touchUserPresence(currentUser);
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

// DELETE: Delete a single message (?id=...) or clear entire chat (?all=true) - Main Admin Only
export async function DELETE(req: Request) {
  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser || currentUser.toLowerCase() !== "main") {
      return NextResponse.json(
        { error: "Only the Main Admin can delete chat messages." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all") === "true";

    await connectToDatabase();
    const ChatModel = getChatMessageModel();

    if (clearAll) {
      await ChatModel.deleteMany({});
      return NextResponse.json({
        success: true,
        message: "All chat messages deleted by Admin.",
      });
    }

    if (!id) {
      return NextResponse.json(
        { error: "Message ID is required to delete." },
        { status: 400 }
      );
    }

    await ChatModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      deletedId: id,
      message: "Message deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error deleting chat message:", error);
    return NextResponse.json(
      { error: "Failed to delete chat message" },
      { status: 500 }
    );
  }
}
