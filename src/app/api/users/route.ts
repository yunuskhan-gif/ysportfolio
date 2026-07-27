import { NextResponse } from "next/server";
import { getAllUsers, createNewUser } from "@/lib/models/User";
import { getCurrentUser } from "@/lib/models/dynamicHelper";

// GET /api/users - List all users (Admin only)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser !== "main") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    const safeUsers = users.map((u) => ({
      id: u.id,
      username: u.username,
      createdAt: u.createdAt,
      isProtected: u.username === "main",
    }));

    return NextResponse.json({ success: true, users: safeUsers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user with username and password (Admin only)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser !== "main") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required to create users." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        { success: false, message: "Username ID is required" },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    const newUser = await createNewUser(username.trim(), password.trim());

    return NextResponse.json({
      success: true,
      message: `User '${newUser.username}' created successfully!`,
      user: {
        id: newUser.id,
        username: newUser.username,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}
