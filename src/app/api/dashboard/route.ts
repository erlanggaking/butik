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
      allTransactions,
      pendingSettlements,
    ] = await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.inventory.findMany({ include: { product: { include: { brand: true } } } }),
      prisma.transaction.findMany({
        where: {
          timestamp: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
          },
        },
        include: { 
          items: { 
            include: { 
              product: { 
                include: { brand: true } 
              } 
            } 
          } 
        },
      }),
      prisma.settlement.findMany({
        where: { status: 'PENDING' },
        include: { brand: true },
      }),
    ])

    const totalStock = inventoryData.reduce((sum, inv) => sum + inv.qty, 0)
    
    // Admin only metrics
    const consignmentLiability = role === 'ADMIN' 
      ? inventoryData
        .filter(inv => inv.product.brand.type === 'CONSIGNMENT')
        .reduce((sum, inv) => sum + inv.qty * inv.product.basePrice, 0)
      : null

    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    const startOfThisMonth = new Date(thisYear, thisMonth, 1)

    const transactionsThisMonth = allTransactions.filter(tx => new Date(tx.timestamp) >= startOfThisMonth)
    const monthRevenue = transactionsThisMonth.reduce((sum, tx) => sum + tx.totalAmount, 0)
    
    const monthMargin = role === 'ADMIN'
      ? monthRevenue - transactionsThisMonth.reduce(
          (sum, tx) => sum + tx.items.reduce((s, i) => s + i.cogs * i.qty, 0), 0
        )
      : null

    // Category Sales Distribution (This Month)
    const categoryMap: Record<string, number> = {}
    transactionsThisMonth.forEach(tx => {
      tx.items.forEach(item => {
        const cat = item.product.category
        categoryMap[cat] = (categoryMap[cat] || 0) + (item.unitPrice * item.qty)
      })
    })
    const salesByCategory = Object.entries(categoryMap)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)

    // Top Brands (This Month)
    const brandMap: Record<string, number> = {}
    transactionsThisMonth.forEach(tx => {
      tx.items.forEach(item => {
        const bName = item.product.brand.name
        brandMap[bName] = (brandMap[bName] || 0) + (item.unitPrice * item.qty)
      })
    })
    const topBrands = Object.entries(brandMap)
      .map(([brand, revenue]) => ({ brand, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Monthly Sales Trend (Last 6 Months)
    const monthlyMap: Record<string, { revenue: number, txCount: number }> = {}
    allTransactions.forEach(tx => {
      const monthStr = new Date(tx.timestamp).toISOString().substring(0, 7) // YYYY-MM
      if (!monthlyMap[monthStr]) monthlyMap[monthStr] = { revenue: 0, txCount: 0 }
      monthlyMap[monthStr].revenue += tx.totalAmount
      monthlyMap[monthStr].txCount += 1
    })
    const monthlySales = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

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
      recentTransactions: allTransactions.slice(0, 10).map(tx => ({
        id: tx.id,
        timestamp: tx.timestamp,
        totalAmount: tx.totalAmount,
        paymentMethod: tx.paymentMethod,
        channel: tx.channel,
        items: tx.items.map(i => ({ qty: i.qty, product: { name: i.product.name, brand: { name: i.product.brand.name } } }))
      })),
      monthlySales,
      salesByCategory,
      topBrands,
      userRole: role,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
