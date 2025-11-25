import mongoose from 'mongoose';

const AnomalySchema = new mongoose.Schema({
  anomaly_id: {
    type: String,
    required: true,
    unique: true
  },
  contract_id: {
    type: String,
    required: true
  },
  contract_title: {
    type: String,
    required: true
  },
  vendor_name: {
    type: String,
    required: true
  },
  ministry: {
    type: String,
    required: true
  },
  rule_triggered: {
    type: String,
    required: true,
    enum: ['overpricing', 'ghost_vendor', 'repeat_awards', 'budget_leakage', 'quick_award', 'split_contracts']
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true
  },
  impact_value: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['open', 'investigating', 'resolved', 'false_positive'],
    default: 'open'
  },
  evidence: {
    type: [String],
    default: []
  },
  assigned_to: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Anomaly || mongoose.model('Anomaly', AnomalySchema);