import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "auditor", "citizen"], default: "citizen" },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
