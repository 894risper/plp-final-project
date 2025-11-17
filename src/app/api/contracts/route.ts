import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Vendor from '../../../../models/vendor';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    await connectMongoDB();
    const contracts = await Contract.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    await connectMongoDB();
    
    const body = await request.json();
    const { contract_id, title, vendor_name, ministry, value, date_awarded, category, description, anomaly_flags } = body;

    const existingContract = await Contract.findOne({ contract_id });
    if (existingContract) {
      return NextResponse.json(
        { error: 'Contract ID already exists' },
        { status: 400 }
      );
    }

    let vendor = await Vendor.findOne({ name: vendor_name });
    if (!vendor) {
      vendor = new Vendor({
        name: vendor_name,
        registry_id: `REG-${new Date().getFullYear()}-${vendor_name.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substr(2, 5)}`,
        digital_footprint_score: Math.floor(Math.random() * 100),
        total_contracts: 1,
        total_value: value,
        first_contract_date: date_awarded,
        last_contract_date: date_awarded,
        anomaly_count: anomaly_flags?.length || 0,
        risk_score: Math.floor(Math.random() * 100),
        ministries: [ministry],
        categories: [category],
        status: 'active'
      });
      await vendor.save();
    }

    const newContract = new Contract({
      contract_id,
      title,
      vendor_id: vendor._id,
      ministry,
      value,
      date_awarded,
      category,
      description,
      anomaly_flags: anomaly_flags || [],
      risk_level: anomaly_flags?.length > 0 ? 'high' : 'low',
      createdBy: (session.user as any).id
    });

    await newContract.save();

    return NextResponse.json({ 
      success: true, 
      contract: newContract 
    });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}