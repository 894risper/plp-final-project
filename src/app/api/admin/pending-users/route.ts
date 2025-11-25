import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import User from '../../../../../models/users';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user } = body;

    console.log('👤 Checking pending users, admin:', user?.email, 'Role:', user?.role);

    // Check if user is admin
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const pendingUsers = await User.find({ 
      role: 'journalist', 
      status: 'pending' 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${pendingUsers.length} pending journalists`);
    return NextResponse.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending users' },
      { status: 500 }
    );
  }
}