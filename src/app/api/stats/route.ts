import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Vendor from '../../../../models/vendor';

export async function GET() {
  try {
    await connectMongoDB();
    
    // Get total contracts
    const totalContracts = await Contract.countDocuments();
    
    // Get total contract value
    const totalValueResult = await Contract.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' }
        }
      }
    ]);
    const totalValue = totalValueResult[0]?.totalValue || 0;
    
    // Get flagged contracts (contracts with anomaly flags)
    const flaggedContracts = await Contract.countDocuments({
      anomaly_flags: { $exists: true, $ne: [] }
    });
    
    // Get active vendors
    const activeVendors = await Vendor.countDocuments({ status: 'active' });

    return NextResponse.json({
      totalContracts,
      totalValue,
      flaggedContracts,
      activeVendors
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}