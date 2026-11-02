import { Schema, model, models, type InferSchemaType } from "mongoose";

const ChatMessageSchema = new Schema(
  {
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    avatarColor: {
      type: String,
      default: "#2563eb",
    },
  },
  {
    timestamps: true,
  }
);

export type ChatMessageDocument = InferSchemaType<typeof ChatMessageSchema> & {
  _id: string;
  createdAt: string | Date;
};

export function getChatMessageModel() {
  return models.ChatMessage || model("ChatMessage", ChatMessageSchema, "chat_messages");
}

