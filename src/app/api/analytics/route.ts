import { NextRequest, NextResponse } from 'next/server'

// Utility to get number of months from timeframe param
function monthsFromTimeframe(tf?: string | null): number {
  switch (tf) {
    case '3months':
      return 3
    case '6months':
      return 6
    case '12months':
    default:
      return 12
    case '24months':
      return 24
  }
}

function generateTrendData(months: number) {
  const now = new Date()
  const data: { month: string; contracts: number; anomalies: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('en-US', { month: 'short', year: months > 12 ? undefined : '2-digit' })
    // Deterministic pseudo-random but stable per month index
    const base = (i * 9301 + 49297) % 233280
    const contracts = Math.round(50 + (base % 150))
    const anomalies = Math.round(5 + (base % 20) / 4)
    data.push({ month: label, contracts, anomalies })
  }
  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe')
    const months = monthsFromTimeframe(timeframe)

    // Mock datasets shaped exactly as DataVisualization expects
    const spendingByMinistry = [
      { ministry: 'Health', amount: 120000000 },
      { ministry: 'Education', amount: 95000000 },
      { ministry: 'Transport', amount: 140000000 },
      { ministry: 'Defense', amount: 110000000 },
      { ministry: 'Agriculture', amount: 80000000 },
      { ministry: 'Energy', amount: 105000000 }
    ]

    const vendorConcentration = [
      { name: 'Top 1-5', value: 38 },
      { name: 'Top 6-10', value: 22 },
      { name: 'Top 11-20', value: 18 },
      { name: 'Others', value: 22 }
    ]

    const trendData = generateTrendData(months)

    const riskByCategory = [
      { category: 'Construction', risk_score: 72 },
      { category: 'IT & Systems', risk_score: 58 },
      { category: 'Healthcare', risk_score: 41 },
      { category: 'Education', risk_score: 36 },
      { category: 'Defense', risk_score: 80 },
      { category: 'Transport', risk_score: 49 }
    ]

    const anomaliesByRegion = [
      { region: 'Nairobi', overpricing: 18, ghost_vendors: 12, repeat_awards: 9, budget_leakage: 7 },
      { region: 'Coast', overpricing: 12, ghost_vendors: 8, repeat_awards: 6, budget_leakage: 5 },
      { region: 'Rift Valley', overpricing: 15, ghost_vendors: 10, repeat_awards: 7, budget_leakage: 6 },
      { region: 'Nyanza', overpricing: 10, ghost_vendors: 7, repeat_awards: 5, budget_leakage: 4 },
      { region: 'Western', overpricing: 9, ghost_vendors: 6, repeat_awards: 5, budget_leakage: 3 },
      { region: 'Eastern', overpricing: 11, ghost_vendors: 7, repeat_awards: 6, budget_leakage: 4 }
    ]

    const payload = {
      spendingByMinistry,
      vendorConcentration,
      anomaliesByRegion,
      trendData,
      riskByCategory
    }

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to generate analytics data' }, { status: 500 })
  }
}
