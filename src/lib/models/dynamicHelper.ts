import { Schema, model, models } from "mongoose";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function getCurrentUser(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("app_auth_token")?.value;
    if (!token) return "main";
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
    const { payload } = await jwtVerify(token, secret);
    return (payload.user as string) || "main";
  } catch (err) {
    return "main";
  }
}

export async function getDynamicModel(baseName: string, schema: Schema, defaultCollectionName: string) {
  const user = await getCurrentUser();
  const modelName = `${baseName}_${user}`;
  const collectionName = user === "main" ? defaultCollectionName : `${defaultCollectionName}_${user}`;
  return models[modelName] || model(modelName, schema, collectionName);
}
