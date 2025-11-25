import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Anomaly from '../../../../models/Anomaly';

export async function GET() {
  try {
    console.log('🔍 Fetching anomalies...');
    await connectMongoDB();
    
    const anomalies = await Anomaly.find({})
      .sort({ timestamp: -1, severity: -1 });

    console.log(`✅ Found ${anomalies.length} anomalies`);
    return NextResponse.json(anomalies);
  } catch (error) {
    console.error('❌ Error fetching anomalies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch anomalies' },
      { status: 500 }
    );
  }
}