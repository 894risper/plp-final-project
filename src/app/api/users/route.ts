import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../../models/users';
import { auth } from '../../../lib/auth';

// GET all users (admin only)
export async function GET() {
  try {
    const session = await getServerSession(auth) as any;
    
    // Check if user is admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const users = await User.find({ role: { $in: ['journalist', 'public'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}