import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/users';
import bcrypt from 'bcryptjs';
import { connectMongoDB as dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { password, token } = await req.json();

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Password reset token is invalid or has expired' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return NextResponse.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}