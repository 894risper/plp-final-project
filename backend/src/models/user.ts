import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin" | "auditor" | "citizen";
}

const userSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "auditor", "citizen"], default: "citizen" },
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);
