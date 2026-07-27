import { Schema, model, models, type InferSchemaType } from "mongoose";
import { connectToDatabase } from "../mongodb";
import { getDB, saveDB } from "../fii-dii/db";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export function getUserModel() {
  return models.AppUser || model("AppUser", UserSchema, "app_users");
}

export interface UserRecord {
  id: string;
  username: string;
  password?: string;
  createdAt: string;
  updatedAt?: string;
}

// Unified helper to get all users (supports both MongoDB and JSON DB fallback)
export async function getAllUsers(): Promise<UserRecord[]> {
  const usersMap: Map<string, UserRecord> = new Map();

  // Always include 'main' default user
  usersMap.set("main", {
    id: "main",
    username: "main",
    createdAt: new Date().toISOString(),
  });

  // 1. Check MongoDB if configured
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const docs = await UserModel.find({}).sort({ createdAt: 1 }).lean();
      docs.forEach((doc: any) => {
        usersMap.set(doc.username.toLowerCase(), {
          id: doc._id.toString(),
          username: doc.username,
          password: doc.password,
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        });
      });
    } catch (err) {
      console.warn("MongoDB connection failed in getAllUsers, using file DB fallback", err);
    }
  }

  // 2. Fallback / Sync from JSON DB
  try {
    const db = getDB();
    if (db.appUsers && typeof db.appUsers === "object") {
      Object.values(db.appUsers).forEach((u: any) => {
        if (u && u.username) {
          const uname = u.username.toLowerCase();
          if (!usersMap.has(uname)) {
            usersMap.set(uname, {
              id: u.id || u._id || uname,
              username: u.username,
              password: u.password,
              createdAt: u.createdAt || new Date().toISOString(),
            });
          }
        }
      });
    }
  } catch (err) {
    console.warn("File DB read failed in getAllUsers", err);
  }

  return Array.from(usersMap.values());
}

// Find user by username
export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const normalized = username.trim().toLowerCase();
  
  // Default main user match
  if (normalized === "main") {
    return {
      id: "main",
      username: "main",
      password: process.env.APP_PASSWORD || "",
      createdAt: new Date().toISOString(),
    };
  }

  if (normalized === "demo") {
    return {
      id: "demo",
      username: "demo",
      password: "demo123",
      createdAt: new Date().toISOString(),
    };
  }

  // Check MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const doc = await UserModel.findOne({ username: normalized }).lean();
      if (doc) {
        return {
          id: (doc as any)._id.toString(),
          username: (doc as any).username,
          password: (doc as any).password,
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("MongoDB user query failed, checking file DB", err);
    }
  }

  // Check JSON DB
  try {
    const db = getDB();
    if (db.appUsers && db.appUsers[normalized]) {
      const u = db.appUsers[normalized];
      return {
        id: u.id || normalized,
        username: u.username,
        password: u.password,
        createdAt: u.createdAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("File DB user query failed", err);
  }

  return null;
}

// Create new user
export async function createNewUser(username: string, password: string): Promise<UserRecord> {
  const normalized = username.trim().toLowerCase();
  
  if (normalized === "main" || normalized === "demo") {
    throw new Error(`Username '${normalized}' is reserved by system.`);
  }

  // Check existing
  const existing = await findUserByUsername(normalized);
  if (existing) {
    throw new Error(`User with username '${username}' already exists.`);
  }

  const now = new Date().toISOString();
  let createdId = normalized;

  // Save to MongoDB
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const newDoc = await UserModel.create({
        username: normalized,
        password,
      });
      createdId = newDoc._id.toString();
    } catch (err: any) {
      console.warn("MongoDB create user failed, continuing to file DB", err);
    }
  }

  // Save to JSON DB as well
  try {
    const db = getDB();
    if (!db.appUsers) db.appUsers = {};
    db.appUsers[normalized] = {
      id: createdId,
      username: normalized,
      password,
      createdAt: now,
    };
    saveDB(db);
  } catch (err) {
    console.warn("File DB save user failed", err);
  }

  return {
    id: createdId,
    username: normalized,
    password,
    createdAt: now,
  };
}

// Update user password
export async function updateUserPassword(username: string, newPassword: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();

  let updated = false;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const res = await UserModel.updateOne({ username: normalized }, { password: newPassword });
      if (res.modifiedCount > 0) updated = true;
    } catch (err) {
      console.warn("MongoDB update password failed", err);
    }
  }

  try {
    const db = getDB();
    if (db.appUsers && db.appUsers[normalized]) {
      db.appUsers[normalized].password = newPassword;
      db.appUsers[normalized].updatedAt = new Date().toISOString();
      saveDB(db);
      updated = true;
    }
  } catch (err) {
    console.warn("File DB update password failed", err);
  }

  return updated;
}

// Delete user
export async function deleteUserByUsername(username: string): Promise<boolean> {
  const normalized = username.trim().toLowerCase();

  if (normalized === "main") {
    throw new Error("Cannot delete main admin user.");
  }

  let deleted = false;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const res = await UserModel.deleteOne({ username: normalized });
      if (res.deletedCount > 0) deleted = true;
    } catch (err) {
      console.warn("MongoDB delete user failed", err);
    }
  }

  try {
    const db = getDB();
    if (db.appUsers && db.appUsers[normalized]) {
      delete db.appUsers[normalized];
      saveDB(db);
      deleted = true;
    }
  } catch (err) {
    console.warn("File DB delete user failed", err);
  }

  return deleted;
}
