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

    // Category Sales Distribution
    const categorySalesMap: Record<string, number> = {}
    transactionsThisMonth.forEach(tx => {
      tx.items.forEach(item => {
        // We need category, but TransactionItem doesn't have it directly.
        // We might need to fetch it or include it.
        // For simplicity, let's use the recentTransactions structure or fetch it.
      })
    })

    // Let's do a more efficient aggregate
    const [salesByCategory, topBrands] = await Promise.all([
      prisma.$queryRaw`
        SELECT p.category, SUM(ti.unitPrice * ti.qty) as revenue
        FROM TransactionItem ti
        JOIN Product p ON ti.productId = p.id
        JOIN "Transaction" t ON ti.transactionId = t.id
        WHERE t.timestamp >= date('now', 'start of month')
        GROUP BY p.category
        ORDER BY revenue DESC
      ` as Promise<Array<{ category: string; revenue: number }>>,
      prisma.$queryRaw`
        SELECT b.name as brand, SUM(ti.unitPrice * ti.qty) as revenue
        FROM TransactionItem ti
        JOIN Product p ON ti.productId = p.id
        JOIN Brand b ON p.brandId = b.id
        JOIN "Transaction" t ON ti.transactionId = t.id
        WHERE t.timestamp >= date('now', 'start of month')
        GROUP BY b.name
        ORDER BY revenue DESC
        LIMIT 5
      ` as Promise<Array<{ brand: string; revenue: number }>>,
    ])

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
      salesByCategory,
      topBrands,
      userRole: role,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
