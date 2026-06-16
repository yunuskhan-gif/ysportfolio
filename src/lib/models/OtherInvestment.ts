import { Schema, model, models, type InferSchemaType } from "mongoose";

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

const OtherInvestmentModel = models.OtherInvestment || model("OtherInvestment", OtherInvestmentSchema);

export default OtherInvestmentModel;
