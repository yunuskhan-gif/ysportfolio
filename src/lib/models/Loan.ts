import { Schema, model, models, type InferSchemaType } from "mongoose";

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

const LoanModel = models.Loan || model("Loan", LoanSchema);

export default LoanModel;
