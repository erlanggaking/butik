import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = session.user

    const [
      totalBrands,
      totalProducts,
      inventoryData,
      transactionsThisMonth,
      pendingSettlements,
      recentTransactions,
      monthlySales,
    ] = await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.inventory.findMany({ include: { product: { include: { brand: true } } } }),
      prisma.transaction.findMany({
        where: {
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        include: { items: true },
      }),
      prisma.settlement.findMany({
        where: { status: 'PENDING' },
        include: { brand: true },
      }),
      prisma.transaction.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: { items: { include: { product: { include: { brand: true } } } } },
      }),
      // Monthly sales for last 6 months
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', timestamp) as month,
          SUM(totalAmount) as revenue,
          COUNT(*) as txCount
        FROM "Transaction"
        WHERE timestamp >= date('now', '-6 months')
        GROUP BY strftime('%Y-%m', timestamp)
        ORDER BY month ASC
      ` as Promise<Array<{ month: string; revenue: number; txCount: number }>>,
    ])

    const totalStock = inventoryData.reduce((sum, inv) => sum + inv.qty, 0)
    
    // Admin only metrics
    const consignmentLiability = role === 'ADMIN' 
      ? inventoryData
        .filter(inv => inv.product.brand.type === 'CONSIGNMENT')
        .reduce((sum, inv) => sum + inv.qty * inv.product.basePrice, 0)
      : null

    const monthRevenue = transactionsThisMonth.reduce((sum, tx) => sum + tx.totalAmount, 0)
    
    const monthMargin = role === 'ADMIN'
      ? monthRevenue - transactionsThisMonth.reduce(
          (sum, tx) => sum + tx.items.reduce((s, i) => s + i.cogs * i.qty, 0), 0
        )
      : null

    return NextResponse.json({
      kpi: {
        totalBrands,
        totalProducts,
        totalStock,
        consignmentLiability,
        monthRevenue,
        monthMargin,
        pendingSettlementsCount: role === 'ADMIN' ? pendingSettlements.length : null,
        pendingSettlementsAmount: role === 'ADMIN' ? pendingSettlements.reduce((s, st) => s + st.commissionAmount, 0) : null,
      },
      recentTransactions,
      monthlySales,
      userRole: role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
