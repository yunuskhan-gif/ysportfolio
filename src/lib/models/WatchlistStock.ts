import { Schema, type InferSchemaType } from "mongoose";
import { getDynamicModel } from "./dynamicHelper";

const WatchlistStockSchema = new Schema(
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
    sector: {
      type: String,
      default: "Equities",
      trim: true,
    },
    type: {
      type: String,
      default: "stock",
      trim: true,
    },
    ltp: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    changePercent: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export type WatchlistStockDocument = InferSchemaType<typeof WatchlistStockSchema> & {
  _id: string;
};

export async function getWatchlistStockModel() {
  return getDynamicModel("WatchlistStock", WatchlistStockSchema, "watchlist_stocks");
}
