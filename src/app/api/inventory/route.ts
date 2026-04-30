import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { classifySlowMover } from '@/lib/ai-engine'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const brandId = searchParams.get('brandId')
    const category = searchParams.get('category')
    const type = searchParams.get('type')

    const inventories = await prisma.inventory.findMany({
      where: {
        product: {
          name: search ? { contains: search } : undefined,
          brandId: brandId ? Number(brandId) : undefined,
          category: category || undefined,
          brand: type ? { type } : undefined,
        },
      },
      include: {
        product: {
          include: { brand: true },
        },
      },
      orderBy: { lastMovementDate: 'asc' },
    })

    const result = inventories.map(inv => {
      const daysWithoutSale = Math.floor(
        (Date.now() - new Date(inv.lastMovementDate).getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        id: inv.id,
        productId: inv.productId,
        sku: inv.product.sku,
        name: inv.product.name,
        category: inv.product.category,
        brand: inv.product.brand.name,
        brandType: inv.product.brand.type,
        basePrice: inv.product.basePrice,
        sellingPrice: inv.product.sellingPrice,
        qty: inv.qty,
        location: inv.location,
        lastMovementDate: inv.lastMovementDate,
        daysWithoutSale,
        aiLabel: classifySlowMover(daysWithoutSale),
        stockValue: inv.qty * inv.product.basePrice,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { inventoryId, qty, location } = body

    const updated = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        qty,
        location,
        lastMovementDate: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 })
  }
}
