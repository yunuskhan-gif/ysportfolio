import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDB, saveDB } from "@/lib/fii-dii/db";

// Helper functions for secure password hashing
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const normalizedUsername = username.trim().toLowerCase();
    if (normalizedUsername.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters long" }, { status: 400 });
    }

    const db = getDB();

    // Check if username already exists
    const userExists = Object.values(db.users).some(
      (u: any) => u.username.toLowerCase() === normalizedUsername
    );

    if (userExists) {
      return NextResponse.json({ error: "Username is already registered" }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    db.users[userId] = {
      id: userId,
      username: username.trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    // Initialize an empty watchlist for the user
    if (!db.watchlists) db.watchlists = {};
    db.watchlists[userId] = [];

    saveDB(db);

    return NextResponse.json({ success: true, message: "User registered successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Invalid register request" }, { status: 400 });
  }
}
