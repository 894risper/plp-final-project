import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../../models/users';
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { firstName, lastName, phone, email, password, role, organization } = body;

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    
    const hashedPassword = await bcrypt.hash(password, 12);

    
    const userData: any = {
      firstName,
      lastName,
      phone: parseInt(phone),
      email,
      password: hashedPassword,
      role: role || 'public',
      organization
    };

    
    if (role === 'journalist') {
      userData.status = 'pending';
    }

    const user = new User(userData);
    await user.save();

    return NextResponse.json({
      success: true,
      message: role === 'journalist' 
        ? 'Journalist account created! Awaiting admin approval.' 
        : 'Account created successfully!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}