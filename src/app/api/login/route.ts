import { NextResponse } from "next/server";
import bcrypt from "bcrypt"

import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/users"; // Import User model



export async function POST(req: Request) {
    try {
        await connectMongoDB(); 

        const { email, password } = await req.json();
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found. Please register first." }, { status: 401 });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

    
        const response = NextResponse.json({ message: "Login successful" });

        

        return response;
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
}