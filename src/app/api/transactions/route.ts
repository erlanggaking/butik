import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 20)

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          items: {
            include: { product: { include: { brand: true } } },
          },
        },
      }),
      prisma.transaction.count(),
    ])

    return NextResponse.json({ transactions, total, page, limit })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { paymentMethod, channel, notes, items, customerId } = body

    // items: [{ productId, qty }]
    // Fetch product prices
    const productIds = items.map((i: { productId: number }) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    })

    const txItems = items.map((item: { productId: number; qty: number }) => {
      const product = products.find(p => p.id === item.productId)!
      return {
        productId: item.productId,
        qty: item.qty,
        unitPrice: product.sellingPrice,
        cogs: product.basePrice,
        margin: (product.sellingPrice - product.basePrice) * item.qty,
      }
    })

    const totalAmount = txItems.reduce(
      (sum: number, i: { unitPrice: number; qty: number }) => sum + i.unitPrice * i.qty, 0
    )

    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const newTx = await tx.transaction.create({
        data: {
          paymentMethod,
          channel,
          notes: notes || '',
          totalAmount,
          customerId: customerId ? Number(customerId) : null,
          items: { create: txItems },
        },
        include: { items: { include: { product: true } } },
      })

      // Update inventory
      for (const item of items) {
        const inv = await tx.inventory.findFirst({ where: { productId: item.productId } })
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              qty: Math.max(0, inv.qty - item.qty),
              lastMovementDate: new Date(),
            },
          })
        }
      }

      // Update customer total spent and VIP tier
      if (customerId) {
        const customer = await tx.customer.findUnique({ where: { id: Number(customerId) } })
        if (customer) {
          const newTotalSpent = customer.totalSpent + totalAmount
          
          // Basic VIP tier logic
          let newTier = 'Regular'
          if (newTotalSpent >= 100000000) newTier = 'Platinum'
          else if (newTotalSpent >= 50000000) newTier = 'Gold'
          else if (newTotalSpent >= 20000000) newTier = 'Silver'

          await tx.customer.update({
            where: { id: Number(customerId) },
            data: { totalSpent: newTotalSpent, vipTier: newTier }
          })
        }
      }

      return newTx
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
