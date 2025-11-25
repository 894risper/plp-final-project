import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import User from '../../../../../models/users';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, status, notes, user } = body;

    console.log('👤 Verifying user, admin:', user?.email, 'Role:', user?.role);

    // Check if user is admin
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();

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
    if (user?.id) {
      try {
        verifiedById = new mongoose.Types.ObjectId(user.id);
      } catch (error) {
        console.error('Invalid admin ID:', error);
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

    console.log('✅ User verification updated:', status);
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