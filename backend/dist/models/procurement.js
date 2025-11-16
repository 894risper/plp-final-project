import mongoose, { Schema } from "mongoose";
const procurementSchema = new Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    department: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "flagged"], default: "pending" },
    flaggedReason: { type: String },
}, { timestamps: true });
export default mongoose.model("Procurement", procurementSchema);
