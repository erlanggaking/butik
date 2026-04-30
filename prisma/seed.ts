import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const brandsData = [
  { name: 'Chanel', type: 'CONSIGNMENT', commissionRate: 0.30 },
  { name: 'Dior', type: 'REGULAR', commissionRate: 0 },
  { name: 'Louis Vuitton', type: 'CONSIGNMENT', commissionRate: 0.28 },
  { name: 'Gucci', type: 'REGULAR', commissionRate: 0 },
  { name: 'Prada', type: 'CONSIGNMENT', commissionRate: 0.32 },
  { name: 'Hermès', type: 'REGULAR', commissionRate: 0 },
  { name: 'Saint Laurent', type: 'CONSIGNMENT', commissionRate: 0.29 },
  { name: 'Balenciaga', type: 'REGULAR', commissionRate: 0 },
  { name: 'Fendi', type: 'CONSIGNMENT', commissionRate: 0.31 },
  { name: 'Valentino', type: 'REGULAR', commissionRate: 0 },
  { name: 'Givenchy', type: 'CONSIGNMENT', commissionRate: 0.27 },
  { name: 'Celine', type: 'REGULAR', commissionRate: 0 },
  { name: 'Loewe', type: 'CONSIGNMENT', commissionRate: 0.33 },
  { name: 'Alexander McQueen', type: 'REGULAR', commissionRate: 0 },
  { name: 'Bottega Veneta', type: 'CONSIGNMENT', commissionRate: 0.30 },
  { name: 'Local Luxury A', type: 'REGULAR', commissionRate: 0 },
  { name: 'Local Luxury B', type: 'CONSIGNMENT', commissionRate: 0.25 },
  { name: 'Indie Designer X', type: 'REGULAR', commissionRate: 0 },
  { name: 'Heritage Batik', type: 'CONSIGNMENT', commissionRate: 0.28 },
  { name: 'Premium Silk Co', type: 'REGULAR', commissionRate: 0 },
]

const categories = ['Handbag', 'Shoes', 'Accessories', 'Outerwear', 'Dress']
const prefixes: Record<string, string> = {
  'Chanel': 'CHA', 'Dior': 'DIO', 'Louis Vuitton': 'LOU', 'Gucci': 'GUC',
  'Prada': 'PRA', 'Hermès': 'HER', 'Saint Laurent': 'SAI', 'Balenciaga': 'BAL',
  'Fendi': 'FEN', 'Valentino': 'VAL', 'Givenchy': 'GIV', 'Celine': 'CEL',
  'Loewe': 'LOE', 'Alexander McQueen': 'ALE', 'Bottega Veneta': 'BOT',
  'Local Luxury A': 'LLA', 'Local Luxury B': 'LLB', 'Indie Designer X': 'IND',
  'Heritage Batik': 'HBK', 'Premium Silk Co': 'PSC',
}
const catCode: Record<string, string> = {
  Handbag: 'HAN', Shoes: 'SHO', Accessories: 'ACC', Outerwear: 'OUT', Dress: 'DRE',
}
const locations = ['Main Store - Shelf A', 'Main Store - Shelf B', 'Main Store - Shelf C', 'Main Store - Shelf D', 'Main Store - Shelf E']

async function main() {
  console.log('🌱 Seeding database...')

  await prisma.transactionItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.inventory.deleteMany()
  await prisma.product.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()
  await prisma.customer.deleteMany()

  // Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const kasirPassword = await bcrypt.hash('kasir123', 10)
  await prisma.user.createMany({
    data: [
      { username: 'admin', password: adminPassword, name: 'Admin Utama', role: 'ADMIN' },
      { username: 'kasir', password: kasirPassword, name: 'Kasir Satu', role: 'CASHIER' },
    ]
  })
  console.log(`✅ Created 2 users (admin, kasir)`)

  // Seed Customers
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Ibu Sarah', phone: '081234567890', vipTier: 'Platinum', totalSpent: 150000000, preferences: 'Suka dress warna gelap' } }),
    prisma.customer.create({ data: { name: 'Bapak Budi', phone: '081987654321', vipTier: 'Gold', totalSpent: 85000000, preferences: 'Suka jam tangan & dompet kulit' } }),
    prisma.customer.create({ data: { name: 'Jessica T.', phone: '085566778899', vipTier: 'Silver', totalSpent: 35000000, preferences: 'Cenderung pilih ukuran S' } }),
    prisma.customer.create({ data: { name: 'Amanda Putri', phone: '082233445566', vipTier: 'Regular', totalSpent: 12000000 } }),
  ])
  console.log(`✅ Created ${customers.length} customers`)

  const brands = []
  for (const b of brandsData) {
    const brand = await prisma.brand.create({ data: b })
    brands.push(brand)
  }
  console.log(`✅ Created ${brands.length} brands`)

  const allProducts: Array<{ id: number; sellingPrice: number; basePrice: number }> = []

  for (let bi = 0; bi < brands.length; bi++) {
    const brand = brands[bi]
    const location = locations[bi % locations.length]

    for (let i = 0; i < 10; i++) {
      const cat = categories[i % categories.length]
      const catC = catCode[cat]
      const prefix = prefixes[brand.name]
      const num = (i + 1).toString().padStart(3, '0')
      const sku = `${prefix}-${catC}-${num}`

      const basePrice = 1600000 + i * 100000
      const sellingPrice = Math.round(basePrice * 1.65)

      const daysAgo = Math.floor(Math.random() * 65)
      const lastMovement = new Date()
      lastMovement.setDate(lastMovement.getDate() - daysAgo)

      const product = await prisma.product.create({
        data: {
          sku,
          name: `${brand.name} ${cat} Collection ${i + 1}`,
          category: cat,
          brandId: brand.id,
          basePrice,
          sellingPrice,
          inventory: {
            create: { qty: 10, location, lastMovementDate: lastMovement }
          }
        }
      })
      allProducts.push({ id: product.id, sellingPrice, basePrice })
    }
  }
  console.log(`✅ Created ${allProducts.length} products with inventory`)

  const paymentMethods = ['Cash', 'Card', 'Transfer', 'QRIS']
  const channels = ['In-Store', 'Online']

  for (let t = 0; t < 50; t++) {
    const daysAgo = Math.floor(Math.random() * 90)
    const txDate = new Date()
    txDate.setDate(txDate.getDate() - daysAgo)

    const numItems = Math.floor(Math.random() * 3) + 1
    const usedIds = new Set<number>()
    const selectedProducts = []

    for (let j = 0; j < numItems; j++) {
      let p
      do { p = allProducts[Math.floor(Math.random() * allProducts.length)] }
      while (usedIds.has(p.id))
      usedIds.add(p.id)
      selectedProducts.push(p)
    }

    const items = selectedProducts.map(p => ({
      productId: p.id, qty: 1, unitPrice: p.sellingPrice,
      cogs: p.basePrice, margin: p.sellingPrice - p.basePrice,
    }))
    const totalAmount = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)

    const isLinkedToCustomer = Math.random() > 0.5
    const customer = isLinkedToCustomer ? customers[Math.floor(Math.random() * customers.length)] : undefined

    await prisma.transaction.create({
      data: {
        timestamp: txDate,
        totalAmount,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        channel: channels[Math.floor(Math.random() * channels.length)],
        customerId: customer?.id,
        items: { create: items }
      }
    })
  }
  console.log(`✅ Created 50 transactions`)

  const consignmentBrands = brands.filter(b => b.type === 'CONSIGNMENT')
  for (const brand of consignmentBrands) {
    const totalSales = Math.floor(Math.random() * 50000000) + 10000000
    await prisma.settlement.create({
      data: {
        brandId: brand.id,
        period: '2025-04',
        totalSales,
        commissionAmount: Math.round(totalSales * brand.commissionRate),
        status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
      }
    })
  }
  console.log(`✅ Created settlements`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
