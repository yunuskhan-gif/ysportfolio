import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const CashbookAccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export type CashbookAccountDocument = InferSchemaType<typeof CashbookAccountSchema> & {
  _id: string;
};

export async function getCashbookAccountModel() {
  return getDynamicModel("CashbookAccount", CashbookAccountSchema, "cashbookaccounts");
}
