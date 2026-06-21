import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const HoldingSchema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 0,
    },
    avgPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    app: {
      type: String,
      default: "Manual",
      trim: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export type HoldingDocument = InferSchemaType<typeof HoldingSchema> & {
  _id: string;
};

export async function getHoldingModel() {
  return getDynamicModel("Holding", HoldingSchema, "holdings");
}
