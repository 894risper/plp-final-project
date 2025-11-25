import mongoose, { Document, Schema } from "mongoose";

export interface IProcurement extends Document {
  title: string;
  amount: number;
  department: string;
  status: "pending" | "approved" | "flagged";
  flaggedReason?: string;
}

const procurementSchema: Schema<IProcurement> = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  department: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "flagged"], default: "pending" },
  flaggedReason: { type: String },
}, { timestamps: true });

export default mongoose.model<IProcurement>("Procurement", procurementSchema);
