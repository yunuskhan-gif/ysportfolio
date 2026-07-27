import { NextResponse } from "next/server";
import { updateUserPassword, deleteUserByUsername } from "@/lib/models/User";
import { getCurrentUser } from "@/lib/models/dynamicHelper";

// PUT /api/users/[id] - Update user password (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser !== "main") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const username = decodeURIComponent(id);
    const body = await request.json();
    const { password } = body;

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: "New password is required" },
        { status: 400 }
      );
    }

    const updated = await updateUserPassword(username, password.trim());

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `User '${username}' not found or could not be updated.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password for user '${username}' updated successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update user password" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user ID (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser !== "main") {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const username = decodeURIComponent(id);

    if (username.toLowerCase() === "main") {
      return NextResponse.json(
        { success: false, message: "Main admin account cannot be deleted." },
        { status: 403 }
      );
    }

    const deleted = await deleteUserByUsername(username);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `User '${username}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ID '${username}' has been deleted successfully!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}
