import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IAnomaly extends Document {
  _id: Types.ObjectId;
  anomaly_id: string;
  contract_id: Types.ObjectId;
  vendor_id: Types.ObjectId;
  rule_triggered: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact_value: number;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  ministry: string;
  detected_by: Types.ObjectId;
  resolved_by?: Types.ObjectId;
  resolved_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const anomalySchema = new Schema<IAnomaly>({
  anomaly_id: { type: String, required: true, unique: true },
  contract_id: { type: Schema.Types.ObjectId, ref: 'Contract', required: true },
  vendor_id: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  rule_triggered: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  description: { type: String, required: true },
  impact_value: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['open', 'investigating', 'resolved', 'false_positive'],
    default: 'open'
  },
  ministry: { type: String, required: true },
  detected_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resolved_by: { type: Schema.Types.ObjectId, ref: 'User' },
  resolved_at: { type: Date }
}, { 
  timestamps: true 
});

const Anomaly: Model<IAnomaly> = mongoose.models.Anomaly as Model<IAnomaly> || mongoose.model<IAnomaly>("Anomaly", anomalySchema);
export default Anomaly;