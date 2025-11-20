import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../../models/users';
import bcrypt from "bcrypt"

// Ensure this route runs on the Node.js runtime (required for bcrypt)
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    await connectMongoDB();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, email, password, role, organization } = body as any;

    // Basic validation
    const missing: string[] = [];
    if (!firstName) missing.push('firstName');
    if (!lastName) missing.push('lastName');
    if (!phone && phone !== 0) missing.push('phone');
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password length check
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Phone validation: accept string or number, normalize to number for schema
    const phoneStr = String(phone).trim();
    const phoneDigits = phoneStr.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      return NextResponse.json(
        { error: 'Phone number should be exactly 10 digits' },
        { status: 400 }
      );
    }
    const phoneNum = Number(phoneDigits);
    if (!Number.isFinite(phoneNum)) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(String(password), 12);

    // Build user data
    const userData: any = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: phoneNum,
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'public',
      organization
    };

    if (userData.role === 'journalist') {
      userData.status = 'pending';
    }

    const user = new User(userData);
    await user.save();

    return NextResponse.json({
      success: true,
      message: userData.role === 'journalist'
        ? 'Journalist account created! Awaiting admin approval.'
        : 'Account created successfully!',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error (full object):', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Handle Mongoose validation and duplicate key errors
    if (error && typeof error === 'object') {
      if (error.code === 11000) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: 'Validation error', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}