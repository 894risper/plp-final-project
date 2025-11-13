import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Vendor from '../../../../models/vendor';
import Anomaly from '../../../../models/Anomaly';

export async function GET() {
  try {
    await connectMongoDB();

    const [
      totalContracts,
      totalValueResult,
      flaggedContracts,
      activeVendors
    ] = await Promise.all([
      
      Contract.countDocuments(),
      
      Contract.aggregate([
        { $group: { _id: null, total: { $sum: '$value' } } }
      ]),
      
      Contract.countDocuments({ 
        $or: [
          { 'anomaly_flags.0': { $exists: true } },
          { risk_level: { $in: ['high', 'critical'] } }
        ]
      }),
      
      
      Vendor.countDocuments({ status: 'active' })
    ]);

    const totalValue = totalValueResult[0]?.total || 0;

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