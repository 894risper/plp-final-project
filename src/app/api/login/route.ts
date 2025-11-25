import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectMongoDB } from "../../../lib/mongodb";
import User from "../../../../models/users";

export async function POST(req: Request) {
    try {
        await connectMongoDB();
        const { email, password } = await req.json();

        console.log('🔐 Login attempt for:', email);

        // Find user in database
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found:', email);
            return NextResponse.json({ 
                success: false,
                message: "Invalid email or password" 
            }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch for:', email);
            return NextResponse.json({ 
                success: false,
                message: "Invalid email or password" 
            }, { status: 401 });
        }

        // Check if account is active
        if (user.status !== 'active') {
            console.log('❌ Account not active:', email, 'Status:', user.status);
            return NextResponse.json({ 
                success: false,
                message: user.status === 'pending' 
                    ? "Account pending admin approval" 
                    : "Account is suspended"
            }, { status: 401 });
        }

        console.log('✅ Login successful for:', email, 'Role:', user.role);

        // Return user data (without password)
        return NextResponse.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {
        console.error("❌ Login Error:", error);
        return NextResponse.json({ 
            success: false,
            message: "Login failed" 
        }, { status: 500 });
    }
}

// Add this to handle OPTIONS requests (CORS)
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}