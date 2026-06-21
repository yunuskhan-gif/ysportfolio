import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const MotilalSessionSchema = new Schema(
  {
    authorization: {
      type: String,
      default: "",
      trim: true,
    },
    accessToken: {
      type: String,
      default: "",
      trim: true,
    },
    savedAt: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const MotilalConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "default",
    },
    clientcode: {
      type: String,
      default: "",
      trim: true,
    },
    userid: {
      type: String,
      default: "",
      trim: true,
    },
    dob: {
      type: String,
      default: "",
      trim: true,
    },
    apiKey: {
      type: String,
      default: "",
      trim: true,
    },
    apiSecretKey: {
      type: String,
      default: "",
      trim: true,
    },
    vendorinfo: {
      type: String,
      default: "",
      trim: true,
    },
    totpSecret: {
      type: String,
      default: "",
      trim: true,
    },
    session: {
      type: MotilalSessionSchema,
      default: () => ({
        authorization: "",
        accessToken: "",
        savedAt: "",
      }),
    },
  },
  {
    timestamps: true,
  }
);

export type MotilalConfigDocument = InferSchemaType<typeof MotilalConfigSchema> & {
  _id: string;
};

export async function getMotilalConfigModel() {
  return getDynamicModel("MotilalConfig", MotilalConfigSchema, "motilalconfigs");
}
