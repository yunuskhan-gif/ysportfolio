import { Schema, model, models, type InferSchemaType } from "mongoose";

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

const CashbookAccountModel = models.CashbookAccount || model("CashbookAccount", CashbookAccountSchema);

export default CashbookAccountModel;
