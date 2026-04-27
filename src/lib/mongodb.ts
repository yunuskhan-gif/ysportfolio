import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "ysportfolio";

if (!mongoUri) {
  throw new Error("Missing MONGODB_URI in environment variables.");
}

const resolvedMongoUri = mongoUri;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongooseCache__: MongooseCache | undefined;
}

const globalCache = global.__mongooseCache__ || {
  conn: null,
  promise: null,
};

global.__mongooseCache__ = globalCache;

export async function connectToDatabase() {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(resolvedMongoUri, {
      dbName,
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
