// models/users.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    phone: number;
    email: string;
    password: string;
    role: 'public' | 'journalist' | 'admin';
    status: 'pending' | 'active' | 'suspended';
    organization?: string;
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
        enum: ['pending', 'active', 'suspended'],
        default: 'active' 
    },
    organization: { type: String } // Simple field for journalist's organization
}, { 
    timestamps: true 
});

const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>("User", userSchema);
export default User;