import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IVendor extends Document {
  _id: Types.ObjectId;
  name: string;
  registry_id: string;
  digital_footprint_score: number;
  total_contracts: number;
  total_value: number;
  first_contract_date: Date;
  last_contract_date: Date;
  anomaly_count: number;
  risk_score: number;
  ministries: string[];
  categories: string[];
  status: 'active' | 'flagged' | 'blacklisted';
  contact_email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>({
  name: { type: String, required: true },
  registry_id: { type: String, required: true, unique: true },
  digital_footprint_score: { type: Number, required: true, min: 0, max: 100 },
  total_contracts: { type: Number, required: true, default: 0 },
  total_value: { type: Number, required: true, default: 0 },
  first_contract_date: { type: Date, required: true },
  last_contract_date: { type: Date, required: true },
  anomaly_count: { type: Number, required: true, default: 0 },
  risk_score: { type: Number, required: true, min: 0, max: 100 },
  ministries: [{ type: String }],
  categories: [{ type: String }],
  status: { 
    type: String, 
    enum: ['active', 'flagged', 'blacklisted'],
    default: 'active'
  },
  contact_email: { type: String },
  address: { type: String }
}, { 
  timestamps: true 
});

const Vendor: Model<IVendor> = mongoose.models.Vendor as Model<IVendor> || mongoose.model<IVendor>("Vendor", vendorSchema);
export default Vendor;