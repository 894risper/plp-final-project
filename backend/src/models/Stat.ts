import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStat extends Document {
  totalContracts: number;
  totalValue: number;
  flaggedContracts: number;
  activeVendors: number;
  updatedAt: Date;
  createdAt: Date;
}

const StatSchema = new Schema<IStat>(
  {
    totalContracts: { type: Number, required: true, default: 0 },
    totalValue: { type: Number, required: true, default: 0 },
    flaggedContracts: { type: Number, required: true, default: 0 },
    activeVendors: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Stat: Model<IStat> = mongoose.models.Stat || mongoose.model<IStat>('Stat', StatSchema);
export default Stat;
