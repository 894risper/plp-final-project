import mongoose, { Document, Model } from 'mongoose';

// Interface for Vendor document
export interface IVendor extends Document {
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
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  registration_date: Date;
  last_updated: Date;
  calculateRiskScore(): void;
}

const VendorSchema = new mongoose.Schema<IVendor>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  registry_id: {
    type: String,
    required: true,
    unique: true
  },
  digital_footprint_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  total_contracts: {
    type: Number,
    required: true,
    default: 0
  },
  total_value: {
    type: Number,
    required: true,
    default: 0
  },
  first_contract_date: {
    type: Date,
    required: true
  },
  last_contract_date: {
    type: Date,
    required: true
  },
  anomaly_count: {
    type: Number,
    required: true,
    default: 0
  },
  risk_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  ministries: [{
    type: String,
    required: true
  }],
  categories: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    required: true,
    enum: ['active', 'flagged', 'blacklisted'],
    default: 'active'
  },
  contact_info: {
    email: String,
    phone: String,
    address: String,
    website: String
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate risk score before saving
VendorSchema.pre('save', function(this: IVendor, next) {
  if (this.isModified('anomaly_count') || this.isModified('digital_footprint_score') || this.isModified('total_contracts')) {
    this.calculateRiskScore();
  }
  next();
});

// Method to calculate risk score
VendorSchema.methods.calculateRiskScore = function(this: IVendor) {
  let riskScore = 0;
  
  // Base risk from digital footprint (inverse relationship)
  riskScore += (100 - this.digital_footprint_score) * 0.3;
  
  // Risk from anomalies
  riskScore += Math.min(this.anomaly_count * 15, 40);
  
  // Risk from contract volume (more contracts = more opportunity for issues)
  if (this.total_contracts > 50) riskScore += 10;
  if (this.total_contracts > 100) riskScore += 10;
  
  // Risk from contract value
  const valueInMillions = this.total_value / 1000000;
  if (valueInMillions > 10) riskScore += 10;
  if (valueInMillions > 50) riskScore += 10;
  
  this.risk_score = Math.min(Math.max(Math.round(riskScore), 0), 100);
};

// Create and export the model
const Vendor: Model<IVendor> = mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;