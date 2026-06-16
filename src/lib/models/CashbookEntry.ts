import { Schema, model, models, type InferSchemaType } from "mongoose";

const CashbookEntrySchema = new Schema(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "CashbookAccount",
      required: true,
    },
    type: {
      type: String,
      enum: ["CASH_IN", "CASH_OUT"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    paymentMode: {
      type: String,
      required: true,
      default: "Cash",
    },
  },
  {
    timestamps: true,
  }
);

export type CashbookEntryDocument = InferSchemaType<typeof CashbookEntrySchema> & {
  _id: string;
};

const CashbookEntryModel = models.CashbookEntry || model("CashbookEntry", CashbookEntrySchema);

export default CashbookEntryModel;
