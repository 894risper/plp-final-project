import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    phone: number;
    email: string;
    password: string;
    role: 'public' | 'journalist' | 'admin';
    status: 'pending' | 'active' | 'suspended' | 'rejected';
    organization?: string;
    verificationNotes?: string;
    verifiedBy?: Types.ObjectId;
    verifiedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['public', 'journalist', 'admin'],
        default: 'public' 
    },
    status: { 
        type: String, 
        enum: ['pending', 'active', 'suspended', 'rejected'],
        default: 'active' 
    },
    organization: { type: String },
    verificationNotes: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date }
}, { 
    timestamps: true 
});


userSchema.pre('save', function(next) {
    if (this.role === 'journalist' && this.isNew) {
        this.status = 'pending';
    }
    next();
});

const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>("User", userSchema);
export default User;