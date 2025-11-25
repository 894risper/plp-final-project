import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Vendor from '../../../../../models/vendor';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    vendor.status = status;
    vendor.last_updated = new Date();
    await vendor.save();

    return NextResponse.json({
      success: true,
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}