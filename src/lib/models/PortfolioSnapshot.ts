import { Schema, model, models, type InferSchemaType } from "mongoose";

const SnapshotHoldingSchema = new Schema(
  {
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    ltp: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    pnl: { type: Number, required: true },
    pnlPercentage: { type: Number, required: true },
  },
  { _id: false }
);

const PortfolioSnapshotSchema = new Schema(
  {
    totalInvested: { type: Number, required: true },
    currentValue: { type: Number, required: true },
    totalPnL: { type: Number, required: true },
    pnlPercentage: { type: Number, required: true },
    holdings: [SnapshotHoldingSchema],
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt`
  }
);

export type PortfolioSnapshotDocument = InferSchemaType<typeof PortfolioSnapshotSchema> & {
  _id: string;
  createdAt: Date;
};

const PortfolioSnapshotModel =
  models.PortfolioSnapshot || model("PortfolioSnapshot", PortfolioSnapshotSchema);

export default PortfolioSnapshotModel;
