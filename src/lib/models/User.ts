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
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    panNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    dob: {
      type: String,
      default: "",
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: String,
      default: "",
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
  fullName?: string;
  panNumber?: string;
  dob?: string;
  avatarUrl?: string;
  profileCompleted?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt?: string;
}

// Global in-memory presence store for instant online/offline tracking
const globalPresence = globalThis as unknown as {
  __userPresenceMap?: Map<string, { lastSeenMs: number; isOffline: boolean }>;
  __lastDbPresenceWrite?: Map<string, number>;
};

if (!globalPresence.__userPresenceMap) {
  globalPresence.__userPresenceMap = new Map();
}
if (!globalPresence.__lastDbPresenceWrite) {
  globalPresence.__lastDbPresenceWrite = new Map();
}

const ONLINE_THRESHOLD_MS = 40 * 1000; // 40 seconds

export async function touchUserPresence(
  username: string,
  forceOffline: boolean = false
): Promise<void> {
  if (!username) return;
  const normalized = username.trim().toLowerCase();
  const nowMs = Date.now();
  const nowIso = forceOffline ? "" : new Date(nowMs).toISOString();

  globalPresence.__userPresenceMap!.set(normalized, {
    lastSeenMs: nowMs,
    isOffline: forceOffline,
  });

  // Throttle DB writes to once every 20 seconds per user (unless forceOffline)
  const lastWrite = globalPresence.__lastDbPresenceWrite!.get(normalized) || 0;
  if (!forceOffline && nowMs - lastWrite < 20 * 1000) {
    return;
  }
  globalPresence.__lastDbPresenceWrite!.set(normalized, nowMs);

  const persistedLastSeen = forceOffline
    ? new Date(nowMs - ONLINE_THRESHOLD_MS - 5000).toISOString()
    : nowIso;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      await UserModel.updateOne(
        { username: normalized },
        { $set: { lastSeen: persistedLastSeen } }
      );
    } catch {}
  }

  try {
    const db = getDB();
    if (!db.appUsers) db.appUsers = {};
    if (db.appUsers[normalized]) {
      db.appUsers[normalized].lastSeen = persistedLastSeen;
      saveDB(db);
    }
  } catch {}
}

export function getUserOnlineStatus(
  username: string,
  dbLastSeen?: string
): { isOnline: boolean; lastSeen: string } {
  const normalized = username.trim().toLowerCase();
  const mem = globalPresence.__userPresenceMap?.get(normalized);
  const nowMs = Date.now();

  if (mem) {
    if (mem.isOffline) {
      return {
        isOnline: false,
        lastSeen: new Date(mem.lastSeenMs).toISOString(),
      };
    }
    if (nowMs - mem.lastSeenMs <= ONLINE_THRESHOLD_MS) {
      return {
        isOnline: true,
        lastSeen: new Date(mem.lastSeenMs).toISOString(),
      };
    }
    return {
      isOnline: false,
      lastSeen: new Date(mem.lastSeenMs).toISOString(),
    };
  }

  if (dbLastSeen) {
    const parsed = Date.parse(dbLastSeen);
    if (!Number.isNaN(parsed)) {
      return {
        isOnline: nowMs - parsed <= ONLINE_THRESHOLD_MS,
        lastSeen: dbLastSeen,
      };
    }
  }

  return { isOnline: false, lastSeen: "" };
}

// Unified helper to get all users (supports both MongoDB and JSON DB fallback)
export async function getAllUsers(): Promise<UserRecord[]> {
  const usersMap: Map<string, UserRecord> = new Map();

  // Always include 'main' and 'demo' default users
  usersMap.set("main", {
    id: "main",
    username: "main",
    fullName: "Primary Admin",
    profileCompleted: true,
    createdAt: new Date().toISOString(),
  });
  usersMap.set("demo", {
    id: "demo",
    username: "demo",
    password: "demo123",
    fullName: "Demo Investor",
    profileCompleted: true,
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
          fullName: doc.fullName || "",
          panNumber: doc.panNumber || "",
          dob: doc.dob || "",
          avatarUrl: doc.avatarUrl || "",
          profileCompleted: Boolean(doc.profileCompleted),
          lastSeen: doc.lastSeen || "",
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
              fullName: u.fullName || "",
              panNumber: u.panNumber || "",
              dob: u.dob || "",
              avatarUrl: u.avatarUrl || "",
              profileCompleted: Boolean(u.profileCompleted),
              lastSeen: u.lastSeen || "",
              createdAt: u.createdAt || new Date().toISOString(),
            });
          } else {
            // Merge profile fields if present in file DB
            const existing = usersMap.get(uname)!;
            usersMap.set(uname, {
              ...existing,
              fullName: existing.fullName || u.fullName || "",
              panNumber: existing.panNumber || u.panNumber || "",
              dob: existing.dob || u.dob || "",
              avatarUrl: existing.avatarUrl || u.avatarUrl || "",
              profileCompleted: existing.profileCompleted || Boolean(u.profileCompleted),
              lastSeen: existing.lastSeen || u.lastSeen || "",
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

  // Check file DB first for main/demo custom overrides if any
  let fileOverride: any = null;
  try {
    const db = getDB();
    if (db.appUsers && db.appUsers[normalized]) {
      fileOverride = db.appUsers[normalized];
    }
  } catch {}

  if (normalized === "main") {
    return {
      id: "main",
      username: "main",
      password: process.env.APP_PASSWORD || "",
      fullName: fileOverride?.fullName || "Primary Admin",
      panNumber: fileOverride?.panNumber || "",
      dob: fileOverride?.dob || "",
      avatarUrl: fileOverride?.avatarUrl || "",
      profileCompleted: true,
      createdAt: new Date().toISOString(),
    };
  }

  if (normalized === "demo" || normalized === "demo@ysportfolio.com" || normalized === "demo@example.com") {
    return {
      id: "demo",
      username: "demo",
      password: "demo123",
      fullName: fileOverride?.fullName || "Demo Investor",
      panNumber: fileOverride?.panNumber || "",
      dob: fileOverride?.dob || "",
      avatarUrl: fileOverride?.avatarUrl || "",
      profileCompleted: true,
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
          fullName: (doc as any).fullName || fileOverride?.fullName || "",
          panNumber: (doc as any).panNumber || fileOverride?.panNumber || "",
          dob: (doc as any).dob || fileOverride?.dob || "",
          avatarUrl: (doc as any).avatarUrl || fileOverride?.avatarUrl || "",
          profileCompleted: Boolean((doc as any).profileCompleted || fileOverride?.profileCompleted),
          createdAt: (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("MongoDB query failed in findUserByUsername", err);
    }
  }

  // Check JSON DB
  if (fileOverride) {
    return {
      id: fileOverride.id || normalized,
      username: fileOverride.username,
      password: fileOverride.password,
      fullName: fileOverride.fullName || "",
      panNumber: fileOverride.panNumber || "",
      dob: fileOverride.dob || "",
      avatarUrl: fileOverride.avatarUrl || "",
      profileCompleted: Boolean(fileOverride.profileCompleted),
      createdAt: fileOverride.createdAt || new Date().toISOString(),
    };
  }

  return null;
}

// Create new user
export async function createNewUser(
  username: string,
  password: string,
  fullName: string = "",
  dob: string = ""
): Promise<UserRecord> {
  const normalized = username.trim().toLowerCase();

  if (normalized === "main" || normalized === "demo") {
    throw new Error(`Username '${normalized}' is reserved by system.`);
  }

  const existing = await findUserByUsername(normalized);
  if (existing) {
    throw new Error(`User with username '${username}' already exists.`);
  }

  const now = new Date().toISOString();
  let createdId = normalized;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      const newDoc = await UserModel.create({
        username: normalized,
        password,
        fullName: fullName.trim(),
        dob: dob.trim(),
        profileCompleted: false,
      });
      createdId = newDoc._id.toString();
    } catch (err: any) {
      console.warn("MongoDB create user failed, continuing to file DB", err);
    }
  }

  try {
    const db = getDB();
    if (!db.appUsers) db.appUsers = {};
    db.appUsers[normalized] = {
      id: createdId,
      username: normalized,
      password,
      fullName: fullName.trim(),
      panNumber: "",
      dob: dob.trim(),
      avatarUrl: "",
      profileCompleted: false,
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
    fullName: fullName.trim(),
    dob: dob.trim(),
    profileCompleted: false,
    createdAt: now,
  };
}

// Update user profile (PAN, DOB, Avatar DP, Full Name)
export async function updateUserProfile(
  username: string,
  data: {
    fullName?: string;
    panNumber?: string;
    dob?: string;
    avatarUrl?: string;
  }
): Promise<UserRecord | null> {
  const normalized = username.trim().toLowerCase();

  const updateFields: Record<string, any> = {
    profileCompleted: true,
  };
  if (data.fullName !== undefined) updateFields.fullName = data.fullName.trim();
  if (data.panNumber !== undefined) updateFields.panNumber = data.panNumber.trim().toUpperCase();
  if (data.dob !== undefined) updateFields.dob = data.dob.trim();
  if (data.avatarUrl !== undefined) updateFields.avatarUrl = data.avatarUrl;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const UserModel = getUserModel();
      await UserModel.updateOne(
        { username: normalized },
        { $set: updateFields },
        { upsert: false }
      );
    } catch (err) {
      console.warn("MongoDB update profile failed", err);
    }
  }

  try {
    const db = getDB();
    if (!db.appUsers) db.appUsers = {};
    const current = db.appUsers[normalized] || {
      id: normalized,
      username: normalized,
      createdAt: new Date().toISOString(),
    };
    db.appUsers[normalized] = {
      ...current,
      ...updateFields,
      updatedAt: new Date().toISOString(),
    };
    saveDB(db);
  } catch (err) {
    console.warn("File DB update profile failed", err);
  }

  return findUserByUsername(normalized);
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
