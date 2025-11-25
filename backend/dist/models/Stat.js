import mongoose, { Schema } from 'mongoose';
const StatSchema = new Schema({
    totalContracts: { type: Number, required: true, default: 0 },
    totalValue: { type: Number, required: true, default: 0 },
    flaggedContracts: { type: Number, required: true, default: 0 },
    activeVendors: { type: Number, required: true, default: 0 },
}, { timestamps: true });
export const Stat = mongoose.models.Stat || mongoose.model('Stat', StatSchema);
export default Stat;
