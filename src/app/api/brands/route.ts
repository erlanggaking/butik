import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateBrandScore } from '@/lib/ai-engine'
import { getSession } from '@/lib/auth'

async function checkAdmin() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') return false
  return true
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const brands = await prisma.brand.findMany({
      include: {
        products: {
          include: {
            inventory: true,
            transactionItems: true,
          },
        },
        _count: { select: { products: true, settlements: true } },
      },
      orderBy: { name: 'asc' },
    })

    const result = brands.map(brand => {
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

      const scoreData = calculateBrandScore(
        brand.id, brand.name, brand.type,
        totalSold, totalStock, totalRevenue, totalCogs
      )

      return {
        id: brand.id,
        name: brand.name,
        type: brand.type,
        commissionRate: brand.commissionRate,
        productCount: brand._count.products,
        totalStock,
        totalSold,
        totalRevenue,
        totalCogs,
        score: scoreData.score,
        turnoverRate: scoreData.turnoverRate,
        marginRate: scoreData.marginRate,
        rank: 0,
      }
    })

    // Rank by score
    const sorted = [...result].sort((a, b) => b.score - a.score)
    sorted.forEach((b, i) => { b.rank = i + 1 })

    return NextResponse.json(sorted)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { name, type, commissionRate } = body

    const brand = await prisma.brand.create({
      data: { name, type, commissionRate: Number(commissionRate) },
    })

    return NextResponse.json(brand)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { id, name, type, commissionRate } = body

    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: { name, type, commissionRate: Number(commissionRate) },
    })

    return NextResponse.json(brand)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 })
  }
}
