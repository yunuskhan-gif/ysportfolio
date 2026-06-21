import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const LoanSchema = new Schema(
  {
    bank: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    sanctionLoan: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    emi: {
      type: Number,
      required: true,
      min: 0,
    },
    outstanding: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export type LoanDocument = InferSchemaType<typeof LoanSchema> & {
  _id: string;
};

export async function getLoanModel() {
  return getDynamicModel("Loan", LoanSchema, "loans");
}
