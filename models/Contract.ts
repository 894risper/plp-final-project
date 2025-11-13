import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IContract extends Document {
  _id: Types.ObjectId;
  contract_id: string;
  title: string;
  vendor_id: Types.ObjectId;
  ministry: string;
  value: number;
  date_awarded: Date;
  end_date?: Date;
  status: 'active' | 'completed' | 'terminated' | 'cancelled';
  description?: string;
  category: string;
  anomaly_flags: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const contractSchema = new Schema<IContract>({
  contract_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  ministry: { type: String, required: true },
  value: { type: Number, required: true },
  date_awarded: { type: Date, required: true },
  end_date: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'terminated', 'cancelled'],
    default: 'active'
  },
  description: { type: String },
  category: { type: String, required: true },
  anomaly_flags: [{ type: String }],
  risk_level: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
  timestamps: true 
});

const Contract: Model<IContract> = mongoose.models.Contract as Model<IContract> || mongoose.model<IContract>("Contract", contractSchema);
export default Contract;