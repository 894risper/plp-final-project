import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import Contract from '../../../../../models/Contract';

// GET single contract
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const contract = await Contract.findById(id).populate('vendor_id', 'name registry_id risk_score');

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

// PUT update contract
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, completion_date, value, user } = body;

    console.log('📝 Updating contract:', id);

    // Check if user is admin
    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const contract = await Contract.findById(id);
    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Update contract fields
    if (title) contract.title = title;
    if (description) contract.description = description;
    if (status) contract.status = status;
    if (completion_date) contract.completion_date = new Date(completion_date);
    if (value) contract.value = value;

    await contract.save();

    console.log('✅ Contract updated successfully');
    return NextResponse.json({
      success: true,
      contract
    });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}

// DELETE contract
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const deletedContract = await Contract.findByIdAndDelete(id);

    if (!deletedContract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}