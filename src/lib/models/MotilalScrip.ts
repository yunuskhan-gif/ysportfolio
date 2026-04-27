import { Schema, model, models } from "mongoose";

const MotilalScripSchema = new Schema(
  {
    symbol: {
      type: String,
      required: true,
      index: true,
    },
    scripCode: {
      type: Number,
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    exchange: {
      type: String,
      default: "NSE",
      index: true,
    },
    expiryDate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique lookups
MotilalScripSchema.index({ symbol: 1, exchange: 1 }, { unique: true });

const MotilalScripModel =
  models.MotilalScrip || model("MotilalScrip", MotilalScripSchema);

export default MotilalScripModel;
