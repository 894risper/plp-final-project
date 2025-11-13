import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWhistleblowerReport extends Document {
  _id: Types.ObjectId;
  report_id: string;
  title: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'reviewing' | 'investigating' | 'resolved' | 'dismissed';
  description: string;
  ministry?: string;
  vendor?: string;
  contract_id?: string;
  evidence_files?: string[];
  is_anonymous: boolean;
  contact_info?: string;
  submitted_by?: Types.ObjectId;
  assigned_to?: Types.ObjectId;
  submitted_at: Date;
  updatedAt: Date;
}

const whistleblowerReportSchema = new Schema<IWhistleblowerReport>({
  report_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['submitted', 'reviewing', 'investigating', 'resolved', 'dismissed'],
    default: 'submitted'
  },
  description: { type: String, required: true },
  ministry: { type: String },
  vendor: { type: String },
  contract_id: { type: String },
  evidence_files: [{ type: String }],
  is_anonymous: { type: Boolean, default: true },
  contact_info: { type: String },
  submitted_by: { type: Schema.Types.ObjectId, ref: 'User' },
  assigned_to: { type: Schema.Types.ObjectId, ref: 'User' }
}, { 
  timestamps: { createdAt: 'submitted_at', updatedAt: 'updatedAt' }
});

const WhistleblowerReport: Model<IWhistleblowerReport> = mongoose.models.WhistleblowerReport as Model<IWhistleblowerReport> || mongoose.model<IWhistleblowerReport>("WhistleblowerReport", whistleblowerReportSchema);
export default WhistleblowerReport;