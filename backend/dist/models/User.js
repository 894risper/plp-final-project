import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['public', 'journalist', 'admin'], default: 'public' },
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
}, { timestamps: true });
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
