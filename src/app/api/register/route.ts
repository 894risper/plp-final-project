// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/users";

interface RegisterBody {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    password: string;
    role?: 'public' | 'journalist';
    organization?: string;
}

export async function POST(req: NextRequest) {
    try {
        const { firstName, lastName, phone, email, password, role = 'public', organization }: RegisterBody = await req.json();
        
        await connectMongoDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" }, 
                { status: 400 }
            );
        }

        // Check if this is the first user - make them admin
        const userCount = await User.countDocuments();
        const userRole = userCount === 0 ? 'admin' : role;

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData: any = { 
            firstName, 
            lastName, 
            phone: parseInt(phone), 
            email, 
            password: hashedPassword,
            role: userRole,
            status: 'active'
        };

        // Add organization only for journalists
        if (role === 'journalist') {
            userData.organization = organization;
        }

        const newUser = await User.create(userData);

        return NextResponse.json(
            { 
                message: `User registered successfully as ${userRole}`,
                user: {
                    id: newUser._id.toString(),
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role
                }
            }, 
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