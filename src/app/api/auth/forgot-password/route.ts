import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/users';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { connectMongoDB as dbConnect } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'maddison53@ethereal.email',
            pass: 'jn7jnAPss4f63QBp6D'
        }
    });

    const mailOptions = {
      to: user.email,
      from: 'passwordreset@demo.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Password reset link sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
