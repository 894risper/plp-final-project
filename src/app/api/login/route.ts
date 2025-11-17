import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongoDB } from "../../../lib/mongodb";
import User, { IUser } from "../../../../models/users";

interface LoginBody {
    email: string;
    password: string;
}

export async function POST(req: Request) {
    try {
        await connectMongoDB();
        const { email, password }: LoginBody = await req.json();
        const user: IUser | null = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: "User not found. Please register first." }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        
        const userData = {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status
        };

        return NextResponse.json({ 
            message: "Login successful",
            user: userData
        });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ message: "Login failed" }, { status: 500 });
    }
}