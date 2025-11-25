import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import User from '../../../../models/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user } = body;

    // Check if user is admin
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const users = await User.find({ 
      role: { $in: ['journalist', 'public'] } 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}