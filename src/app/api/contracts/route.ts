import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Vendor from '../../../../models/vendor';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    // Check if user is admin
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    connectMongoDB();
    
    const body = await request.json();
    const { contract_id, title, vendor_name, ministry, value, date_awarded, category, description, anomaly_flags } = body;

    // Check if contract already exists
    const existingContract = await Contract.findOne({ contract_id });
    if (existingContract) {
      return NextResponse.json(
        { error: 'Contract ID already exists' },
        { status: 400 }
      );
    }

    // Find or create vendor
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

    // Create contract
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
      createdBy: session.user.id
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