import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDB, saveDB } from "@/lib/fii-dii/db";

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const db = getDB();
    const normalizedUsername = username.trim().toLowerCase();

    // Find user
    const user = Object.values(db.users).find(
      (u: any) => u.username.toLowerCase() === normalizedUsername
    ) as any;

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Generate random session token
    const token = crypto.randomBytes(24).toString("hex");
    
    if (!db.sessions) db.sessions = {};
    db.sessions[token] = user.id;

    saveDB(db);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid login request" }, { status: 400 });
  }
}
