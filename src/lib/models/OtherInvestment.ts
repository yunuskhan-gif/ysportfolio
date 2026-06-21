import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const OtherInvestmentSchema = new Schema(
  {
    particulars: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export type OtherInvestmentDocument = InferSchemaType<typeof OtherInvestmentSchema> & {
  _id: string;
};

export async function getOtherInvestmentModel() {
  return getDynamicModel("OtherInvestment", OtherInvestmentSchema, "otherinvestments");
}
