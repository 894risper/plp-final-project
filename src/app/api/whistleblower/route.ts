import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../lib/mongodb';
import WhistleblowerReport from '../../../../models/WhistleblowerReport';

export async function GET() {
  try {
    await connectMongoDB();

    const reports = await WhistleblowerReport.find({})
      .sort({ submitted_at: -1 })
      .limit(50)
      .lean();

    const reportsData = reports.map(report => ({
      ...report,
      _id: report._id.toString(),
      submitted_at: report.submitted_at.toISOString(),
    }));

    return NextResponse.json(reportsData);
  } catch (error) {
    console.error('Error fetching whistleblower reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { title, category, severity, ministry, vendor, contract_id, description, is_anonymous, contact_info } = body;

    // Generate report ID
    const reportCount = await WhistleblowerReport.countDocuments();
    const report_id = `WB-${new Date().getFullYear()}-${(reportCount + 1).toString().padStart(3, '0')}`;

    const newReport = new WhistleblowerReport({
      report_id,
      title,
      category,
      severity,
      ministry,
      vendor,
      contract_id,
      description,
      is_anonymous: is_anonymous !== false, // Default to true
      contact_info: is_anonymous ? undefined : contact_info,
      status: 'submitted'
    });

    await newReport.save();

    return NextResponse.json({ 
      success: true, 
      report_id: newReport.report_id 
    });
  } catch (error) {
    console.error('Error creating whistleblower report:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}