import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IContract extends Document {
  contract_id: string;
  title: string;
  vendor_id: Types.ObjectId;
  ministry: string;
  value: number;
  date_awarded: Date;
  end_date?: Date;
  completion_date?: Date;
  category: string;
  description?: string;
  anomaly_flags: string[];
  risk_level: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'terminated' | 'pending';
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
  completion_date: { type: Date },
  category: { type: String, required: true },
  description: { type: String },
  anomaly_flags: [{ type: String }],
  risk_level: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'low' 
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'terminated', 'pending'],
    default: 'active' 
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { 
  timestamps: true 
});

const Contract: Model<IContract> = mongoose.models.Contract as Model<IContract> || mongoose.model<IContract>("Contract", contractSchema);
export default Contract;