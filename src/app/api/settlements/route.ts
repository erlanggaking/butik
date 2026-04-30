import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function checkAdmin() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') return false
  return true
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const settlements = await prisma.settlement.findMany({
      include: { brand: true },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(settlements)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, status } = body

    const updated = await prisma.settlement.update({
      where: { id: Number(id) },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
      include: { brand: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settlement' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { brandId, period, totalSales, commissionAmount } = body

    const settlement = await prisma.settlement.create({
      data: { brandId, period, totalSales, commissionAmount, status: 'PENDING' },
      include: { brand: true },
    })

    return NextResponse.json(settlement)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create settlement' }, { status: 500 })
  }
}
