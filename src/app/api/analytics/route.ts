import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../lib/mongodb';
import Contract from '../../../../models/Contract';
import Anomaly from '../../../../models/Anomaly';

interface SpendingByMinistry {
  ministry: string;
  amount: number;
  contracts: number;
}

interface VendorConcentration {
  name: string;
  value: number;
}

interface AnomaliesByRegion {
  region: string;
  total: number;
  overpricing: number;
  ghost_vendors: number;
  repeat_awards: number;
  budget_leakage: number;
}

interface TrendData {
  month: string;
  contracts: number;
  spending: number;
  anomalies: number;
}

interface RiskByCategory {
  category: string;
  total_value: number;
  contracts: number;
  risk_score: number;
}

interface VendorRawData {
  name: string;
  value: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '12months';
    
    await connectMongoDB();

    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '24months':
        startDate.setMonth(now.getMonth() - 24);
        break;
      default: // 12 months
        startDate.setMonth(now.getMonth() - 12);
    }

    console.log(`📊 Fetching analytics for timeframe: ${timeframe}, from: ${startDate}`);

    // 1. Spending by Ministry - Real aggregation from Contracts
    const spendingByMinistry: SpendingByMinistry[] = await Contract.aggregate([
      {
        $match: {
          $or: [
            { date_awarded: { $gte: startDate } },
            { createdAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: '$ministry',
          amount: { $sum: { $ifNull: ['$value', '$contractValue', '$amount', 0] } },
          contracts: { $sum: 1 }
        }
      },
      {
        $project: {
          ministry: { $ifNull: ['$_id', 'Unknown Ministry'] },
          amount: 1,
          contracts: 1,
          _id: 0
        }
      },
      {
        $sort: { amount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // 2. Vendor Concentration - Real aggregation from Contracts
    const vendorConcentrationRaw = await Contract.aggregate<{
      _id: null;
      totalValue: number;
      vendors: VendorRawData[];
    }>([
      {
        $match: {
          $or: [
            { date_awarded: { $gte: startDate } },
            { createdAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: '$vendor_id',
          contractValue: { $sum: { $ifNull: ['$value', '$contractValue', '$amount', 0] } }
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: '_id',
          foreignField: '_id',
          as: 'vendorInfo'
        }
      },
      {
        $unwind: { path: '$vendorInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$contractValue' },
          vendors: {
            $push: {
              name: { $ifNull: ['$vendorInfo.name', 'Unknown Vendor'] },
              value: '$contractValue'
            }
          }
        }
      }
    ]);

    // Process vendor concentration data
    const vendorConcentration: VendorConcentration[] = [];
    if (vendorConcentrationRaw.length > 0 && vendorConcentrationRaw[0].vendors) {
      const vendors = vendorConcentrationRaw[0].vendors
        .sort((a: VendorRawData, b: VendorRawData) => b.value - a.value)
        .slice(0, 6);

      // Calculate percentages
      const totalValue = vendorConcentrationRaw[0].totalValue;
      const processedVendors = vendors.map((vendor: VendorRawData) => ({
        name: vendor.name,
        value: Math.round((vendor.value / totalValue) * 100 * 10) / 10
      }));

      // Group remaining vendors as "Others"
      if (vendorConcentrationRaw[0].vendors.length > 6) {
        const othersValue = vendorConcentrationRaw[0].vendors
          .slice(6)
          .reduce((sum: number, vendor: VendorRawData) => sum + vendor.value, 0);
        
        if (othersValue > 0) {
          const othersPercentage = Math.round((othersValue / totalValue) * 100 * 10) / 10;
          processedVendors.push({
            name: 'Other Vendors',
            value: othersPercentage
          });
        }
      }

      vendorConcentration.push(...processedVendors.map(vendor => ({
        ...vendor,
        name: vendor.name.length > 15 ? vendor.name.substring(0, 15) + '...' : vendor.name
      })));
    }

    // 3. Anomalies by Region (using ministry as region) - Real aggregation from Anomalies
    const anomaliesByRegion: AnomaliesByRegion[] = await Anomaly.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$ministry',
          total: { $sum: 1 },
          overpricing: {
            $sum: { $cond: [{ $eq: ['$rule_triggered', 'overpricing'] }, 1, 0] }
          },
          ghost_vendors: {
            $sum: { $cond: [{ $eq: ['$rule_triggered', 'ghost_vendor'] }, 1, 0] }
          },
          repeat_awards: {
            $sum: { $cond: [{ $eq: ['$rule_triggered', 'repeat_awards'] }, 1, 0] }
          },
          budget_leakage: {
            $sum: { $cond: [{ $eq: ['$rule_triggered', 'budget_leakage'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          region: { $ifNull: ['$_id', 'Unknown Region'] },
          total: 1,
          overpricing: 1,
          ghost_vendors: 1,
          repeat_awards: 1,
          budget_leakage: 1,
          _id: 0
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 6
      }
    ]);

    // 4. Monthly Trend Data - Real aggregation from Contracts and Anomalies
    const trendData: TrendData[] = await Contract.aggregate([
      {
        $match: {
          $or: [
            { date_awarded: { $gte: startDate } },
            { createdAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: {
            year: { $year: { $ifNull: ['$date_awarded', '$createdAt'] } },
            month: { $month: { $ifNull: ['$date_awarded', '$createdAt'] } }
          },
          contracts: { $sum: 1 },
          spending: { $sum: { $ifNull: ['$value', '$contractValue', '$amount', 0] } }
        }
      },
      {
        $lookup: {
          from: 'anomalies',
          let: {
            year: '$_id.year',
            month: '$_id.month'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: [{ $year: '$timestamp' }, '$$year'] },
                    { $eq: [{ $month: '$timestamp' }, '$$month'] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                count: { $sum: 1 }
              }
            }
          ],
          as: 'anomalies'
        }
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateToString: {
              format: '%b %Y',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1
                }
              }
            }
          },
          contracts: 1,
          spending: 1,
          anomalies: { $ifNull: [{ $arrayElemAt: ['$anomalies.count', 0] }, 0] }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    // 5. Risk by Category - Real aggregation from Contracts and Anomalies
    const riskByCategory: RiskByCategory[] = await Contract.aggregate([
      {
        $match: {
          $or: [
            { date_awarded: { $gte: startDate } },
            { createdAt: { $gte: startDate } }
          ]
        }
      },
      {
        $group: {
          _id: '$category',
          total_value: { $sum: { $ifNull: ['$value', '$contractValue', '$amount', 0] } },
          contracts: { $sum: 1 },
          avg_value: { $avg: { $ifNull: ['$value', '$contractValue', '$amount', 0] } }
        }
      },
      {
        $lookup: {
          from: 'anomalies',
          localField: '_id',
          foreignField: 'rule_triggered',
          as: 'category_anomalies'
        }
      },
      {
        $project: {
          category: { $ifNull: ['$_id', 'Uncategorized'] },
          total_value: 1,
          contracts: 1,
          risk_score: {
            $min: [
              100,
              {
                $add: [
                  {
                    $multiply: [
                      { $size: '$category_anomalies' },
                      15
                    ]
                  },
                  {
                    $cond: [
                      { $gt: ['$avg_value', 1000000] },
                      25,
                      {
                        $cond: [
                          { $gt: ['$avg_value', 500000] },
                          15,
                          5
                        ]
                      }
                    ]
                  },
                  {
                    $cond: [
                      { $gt: ['$contracts', 100] },
                      20,
                      {
                        $cond: [
                          { $gt: ['$contracts', 50] },
                          10,
                          0
                        ]
                      }
                    ]
                  },
                  {
                    $cond: [
                      { $gt: ['$total_value', 50000000] },
                      15,
                      {
                        $cond: [
                          { $gt: ['$total_value', 10000000] },
                          8,
                          0
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          },
          _id: 0
        }
      },
      {
        $sort: { risk_score: -1 }
      },
      {
        $limit: 8
      }
    ]);

    console.log('📈 Analytics data fetched successfully:', {
      spendingByMinistry: spendingByMinistry.length,
      vendorConcentration: vendorConcentration.length,
      anomaliesByRegion: anomaliesByRegion.length,
      trendData: trendData.length,
      riskByCategory: riskByCategory.length
    });

    return NextResponse.json({
      spendingByMinistry,
      vendorConcentration,
      anomaliesByRegion,
      trendData,
      riskByCategory
    });

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}