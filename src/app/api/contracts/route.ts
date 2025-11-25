import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Vendor from '../../../../models/vendor';

// GET all contracts
export async function GET() {
  try {
    console.log('📋 Fetching all contracts...');
    await connectMongoDB();
    
    const contracts = await Contract.find({})
      .populate('vendor_id', 'name registry_id risk_score')
      .sort({ date_awarded: -1 });

    console.log(`✅ Found ${contracts.length} contracts`);
    return NextResponse.json(contracts);
  } catch (error) {
    console.error('❌ Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST create new contract
export async function POST(request: Request) {
  try {
    console.log('📝 Starting contract creation...');
    await connectMongoDB();
    
    const body = await request.json();
    const { 
      contract_id, 
      title, 
      vendor_name, 
      ministry, 
      value, 
      date_awarded, 
      category, 
      description, 
      anomaly_flags,
      user
    } = body;

    console.log('👤 User creating contract:', user?.email, 'Role:', user?.role);

    // Check if user is admin
    if (user?.role !== 'admin') {
      console.log('❌ Unauthorized: User is not admin');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Check if contract already exists
    const existingContract = await Contract.findOne({ contract_id });
    if (existingContract) {
      console.log('❌ Contract ID already exists:', contract_id);
      return NextResponse.json(
        { error: 'Contract ID already exists' },
        { status: 400 }
      );
    }

    let vendor = await Vendor.findOne({ name: vendor_name });
    if (!vendor) {
      console.log('🆕 Creating new vendor:', vendor_name);
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
      createdBy: user.id
    });

    await newContract.save();

    console.log('✅ Contract created successfully:', contract_id);
    return NextResponse.json({ 
      success: true, 
      contract: newContract 
    });
  } catch (error) {
    console.error('❌ Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}