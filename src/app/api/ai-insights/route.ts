import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { classifySlowMover, generateDemandForecast, calculateBrandScore } from '@/lib/ai-engine'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentMonth = new Date().getMonth() + 1

    // Slow movers
    const inventories = await prisma.inventory.findMany({
      include: { product: { include: { brand: true } } },
    })

    const slowMovers = inventories.map(inv => {
      const daysWithoutSale = Math.floor(
        (Date.now() - new Date(inv.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        productId: inv.productId,
        productName: inv.product.name,
        sku: inv.product.sku,
        category: inv.product.category,
        brandName: inv.product.brand.name,
        brandType: inv.product.brand.type,
        daysWithoutSale,
        qty: inv.qty,
        sellingPrice: inv.product.sellingPrice,
        label: classifySlowMover(daysWithoutSale),
      }
    }).sort((a, b) => b.daysWithoutSale - a.daysWithoutSale)

    const clearanceCandidates = slowMovers.filter(s => s.label === 'Clearance Candidate')
    const monitors = slowMovers.filter(s => s.label === 'Monitor')

    // Demand forecast
    const demandForecast = generateDemandForecast(currentMonth)

    // Brand scores
    const brands = await prisma.brand.findMany({
      include: {
        products: {
          include: { inventory: true, transactionItems: true }
        }
      }
    })

    const brandScores = brands.map(brand => {
      const totalStock = brand.products.reduce(
        (sum, p) => sum + p.inventory.reduce((s, inv) => s + inv.qty, 0), 0
      )
      const totalSold = brand.products.reduce(
        (sum, p) => sum + p.transactionItems.reduce((s, ti) => s + ti.qty, 0), 0
      )
      const totalRevenue = brand.products.reduce(
        (sum, p) => sum + p.transactionItems.reduce((s, ti) => s + ti.unitPrice * ti.qty, 0), 0
      )
      const totalCogs = brand.products.reduce(
        (sum, p) => sum + p.transactionItems.reduce((s, ti) => s + ti.cogs * ti.qty, 0), 0
      )

      return calculateBrandScore(brand.id, brand.name, brand.type, totalSold, totalStock, totalRevenue, totalCogs)
    }).sort((a, b) => b.score - a.score).map((b, i) => ({ ...b, rank: i + 1 }))

    return NextResponse.json({
      slowMovers: { clearanceCandidates, monitors, totalSlowMovers: clearanceCandidates.length },
      demandForecast,
      brandScores,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch AI insights' }, { status: 500 })
  }
}
