import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'

// Attempt to load env vars from backend/.env if not already present (useful for local dev)
if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
    dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') })
}

export const connectMongoDB = async () => {
    try {
        // Support both MONGODB_URI and MONGO_URI for compatibility
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error("MongoDB URI is missing in environment variables (expected MONGODB_URI or MONGO_URI).");
        }

        // Avoid creating multiple connections in dev/Hot Reload
        if (mongoose.connection.readyState === 1) {
            return;
        }

        await mongoose.connect(mongoURI);
        console.log("✅Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // Re-throw to let the caller handle and return a proper response, but do not crash the server
        throw error;
    }
};