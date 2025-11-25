import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Vendor from '../../../../models/vendor';
import { Types } from 'mongoose';

export async function GET() {
  try {
    await connectMongoDB();

    const vendors = await Vendor.find({})
      .sort({ total_value: -1 })
      .limit(50)
      .lean();

    // Type-safe mapping using type assertion
    const vendorsData = vendors.map(vendor => ({
      ...vendor,
      _id: (vendor._id as Types.ObjectId).toString(), // Proper type assertion
      first_contract_date: vendor.first_contract_date?.toISOString() || new Date().toISOString(),
      last_contract_date: vendor.last_contract_date?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(vendorsData);
  } catch (error: unknown) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}