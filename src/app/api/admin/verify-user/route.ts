import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import User from '../../../../../models/users';
import { auth } from '@/lib/auth';
import mongoose from 'mongoose';

interface ExtendedSession {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  };
}

export async function POST(request: Request) {
  try {
    const session = await auth() as ExtendedSession;
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const body = await request.json();
    const { userId, status, notes } = body;

    // Validate required fields
    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const userToVerify = await User.findById(userId);
    if (!userToVerify) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert string ID to ObjectId for verifiedBy
    let verifiedById = null;
    if (session.user.id) {
      try {
        verifiedById = new mongoose.Types.ObjectId(session.user.id);
      } catch (error) {
        console.error('Invalid admin ID:', error);
        // Continue without verifiedBy if ID is invalid
      }
    }

    // Update user
    userToVerify.status = status;
    userToVerify.verificationNotes = notes;
    
    if (verifiedById) {
      userToVerify.verifiedBy = verifiedById;
    }
    
    userToVerify.verifiedAt = new Date();

    await userToVerify.save();

    return NextResponse.json({
      success: true,
      message: `User ${status} successfully`
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { error: 'Failed to verify user' },
      { status: 500 }
    );
  }
}