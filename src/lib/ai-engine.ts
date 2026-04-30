// AI Engine — Simulated AI logic for boutique inventory analytics

export interface SlowMoverResult {
  productId: number
  productName: string
  sku: string
  category: string
  brandName: string
  daysWithoutSale: number
  qty: number
  sellingPrice: number
  label: 'Clearance Candidate' | 'Monitor' | 'Healthy'
}

export interface DemandForecast {
  category: string
  currentMonth: number
  nextMonth: number
  trend: 'up' | 'down' | 'stable'
  reason: string
}

export interface BrandScore {
  brandId: number
  brandName: string
  type: string
  score: number
  turnoverRate: number
  marginRate: number
  rank: number
}

// Categorize slow-movers based on days without sale
export function classifySlowMover(daysWithoutSale: number): SlowMoverResult['label'] {
  if (daysWithoutSale > 30) return 'Clearance Candidate'
  if (daysWithoutSale > 15) return 'Monitor'
  return 'Healthy'
}

// Demand forecast per category (seasonal simulation)
export function generateDemandForecast(month: number): DemandForecast[] {
  // Month 1–12
  const isPartySeasonApproaching = month >= 10 || month <= 1

  return [
    {
      category: 'Dress',
      currentMonth: isPartySeasonApproaching ? 85 : 60,
      nextMonth: isPartySeasonApproaching ? 95 : 55,
      trend: isPartySeasonApproaching ? 'up' : 'down',
      reason: isPartySeasonApproaching
        ? 'Mendekati musim pesta & akhir tahun, permintaan Dress meningkat signifikan.'
        : 'Musim pesta berlalu, permintaan mulai normalisasi.',
    },
    {
      category: 'Handbag',
      currentMonth: 75,
      nextMonth: 78,
      trend: 'up',
      reason: 'Handbag luxury tetap stabil dengan tren naik bertahap sepanjang tahun.',
    },
    {
      category: 'Shoes',
      currentMonth: 65,
      nextMonth: 70,
      trend: 'up',
      reason: 'Permintaan Shoes meningkat menjelang musim pernikahan.',
    },
    {
      category: 'Outerwear',
      currentMonth: month >= 6 && month <= 8 ? 80 : 50,
      nextMonth: month >= 6 && month <= 8 ? 75 : 55,
      trend: month >= 6 && month <= 8 ? 'down' : 'stable',
      reason:
        month >= 6 && month <= 8
          ? 'Musim liburan sekolah, permintaan Outerwear mulai turun.'
          : 'Outerwear stabil, mendekati musim hujan permintaan sedikit naik.',
    },
    {
      category: 'Accessories',
      currentMonth: 70,
      nextMonth: 72,
      trend: 'stable',
      reason: 'Accessories cenderung stabil sepanjang tahun dengan fluktuasi minimal.',
    },
  ]
}

// Brand Performance Index: (turnoverRate * 60%) + (marginRate * 40%), scale 1-100
export function calculateBrandScore(
  brandId: number,
  brandName: string,
  type: string,
  totalSold: number,
  totalStock: number,
  totalRevenue: number,
  totalCogs: number
): BrandScore {
  const turnoverRate = totalStock > 0 ? Math.min((totalSold / (totalSold + totalStock)) * 100, 100) : 0
  const marginRate = totalRevenue > 0 ? Math.min(((totalRevenue - totalCogs) / totalRevenue) * 100, 100) : 0
  const score = Math.round(turnoverRate * 0.6 + marginRate * 0.4)

  return {
    brandId,
    brandName,
    type,
    score,
    turnoverRate: Math.round(turnoverRate * 10) / 10,
    marginRate: Math.round(marginRate * 10) / 10,
    rank: 0, // filled in after sorting
  }
}
