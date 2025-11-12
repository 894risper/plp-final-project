import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/users";

interface Register {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
}

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, phone, email, password }: Register = await req.json();
        
        await connectMongoDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" }, 
                { status: 400 }
            );
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        await User.create({ 
            firstName, 
            lastName, 
            phone, 
            email, 
            password: hashedPassword 
        });

        return NextResponse.json(
            { message: "User registered successfully" }, 
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred while registering the user" },
            { status: 500 }
        );
    }
}