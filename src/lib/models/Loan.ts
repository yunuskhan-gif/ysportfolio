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
    roi: {
      type: Number,
      default: 0,
      min: 0,
    },
    tenureMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    emiDay: {
      type: Number,
      default: 5,
      min: 1,
      max: 31,
    },
    payments: [
      {
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        paymentDate: {
          type: String,
          required: true,
        },
        utrNumber: {
          type: String,
          required: true,
          trim: true,
        },
        paymentMode: {
          type: String,
          default: "Auto Debit",
        },
        remarks: {
          type: String,
          default: "",
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
