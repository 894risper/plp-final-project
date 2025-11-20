import { NextResponse } from 'next/server';


import { connectMongoDB } from '../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '12months';
    
    await connectMongoDB();

    
    const now = new Date();
    let targetMonth = now.getMonth(); 
    const targetYear = now.getFullYear();

    switch (timeframe) {
      case '3months':
        targetMonth -= 3;
        break;
      case '6months':
        targetMonth -= 6;
        break;
      case '24months':
        targetMonth -= 24;
        break;
      default: // 12 months
        targetMonth -= 12;
    }
    const startDate = new Date(targetYear, targetMonth, now.getDate());

    
    const spendingByMinistry = [
      { ministry: 'Health', amount: 450000000, contracts: 1243 },
      { ministry: 'Defense', amount: 680000000, contracts: 892 },
      { ministry: 'Education', amount: 320000000, contracts: 1567 },
      { ministry: 'Transport', amount: 280000000, contracts: 634 },
      { ministry: 'Infrastructure', amount: 520000000, contracts: 789 },
      { ministry: 'Interior', amount: 190000000, contracts: 456 }
    ];

    const vendorConcentration = [
      { name: 'Top 5 Vendors', value: 35, count: 5 },
      { name: 'Next 15 Vendors', value: 28, count: 15 },
      { name: 'Next 50 Vendors', value: 22, count: 50 },
      { name: 'Other Vendors', value: 15, count: 1186 }
    ];

    const anomaliesByRegion = [
      { region: 'Central', total: 45, overpricing: 15, ghost_vendors: 8, repeat_awards: 12, budget_leakage: 10 },
      { region: 'Northern', total: 32, overpricing: 12, ghost_vendors: 5, repeat_awards: 8, budget_leakage: 7 },
      { region: 'Southern', total: 28, overpricing: 10, ghost_vendors: 6, repeat_awards: 7, budget_leakage: 5 },
      { region: 'Eastern', total: 23, overpricing: 8, ghost_vendors: 4, repeat_awards: 6, budget_leakage: 5 },
      { region: 'Western', total: 35, overpricing: 13, ghost_vendors: 7, repeat_awards: 9, budget_leakage: 6 }
    ];

    const trendData = [
      { month: 'Jan', contracts: 1240, anomalies: 18, spending: 125000000 },
      { month: 'Feb', contracts: 1180, anomalies: 22, spending: 118000000 },
      { month: 'Mar', contracts: 1350, anomalies: 31, spending: 142000000 },
      { month: 'Apr', contracts: 1290, anomalies: 25, spending: 135000000 },
      { month: 'May', contracts: 1420, anomalies: 28, spending: 156000000 },
      { month: 'Jun', contracts: 1380, anomalies: 34, spending: 148000000 },
      { month: 'Jul', contracts: 1450, anomalies: 29, spending: 162000000 },
      { month: 'Aug', contracts: 1520, anomalies: 36, spending: 171000000 },
      { month: 'Sep', contracts: 1480, anomalies: 32, spending: 165000000 },
      { month: 'Oct', contracts: 1610, anomalies: 41, spending: 182000000 },
      { month: 'Nov', contracts: 1580, anomalies: 38, spending: 178000000 },
      { month: 'Dec', contracts: 1670, anomalies: 44, spending: 195000000 }
    ];

    const riskByCategory = [
      { category: 'IT Services', total_value: 245000000, risk_score: 65, contracts: 234 },
      { category: 'Medical Equipment', total_value: 180000000, risk_score: 72, contracts: 156 },
      { category: 'Infrastructure', total_value: 520000000, risk_score: 45, contracts: 189 },
      { category: 'Security Systems', total_value: 320000000, risk_score: 85, contracts: 89 },
      { category: 'Pharmaceuticals', total_value: 125000000, risk_score: 55, contracts: 234 },
      { category: 'Consulting', total_value: 89000000, risk_score: 78, contracts: 145 }
    ];

    return NextResponse.json({
      spendingByMinistry,
      vendorConcentration,
      anomaliesByRegion,
      trendData,
      riskByCategory
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}