import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { setSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    console.log('Login attempt for:', username)
    
    // Check DB connectivity
    try {
      await prisma.$connect()
      console.log('DB connected successfully')
    } catch (dbErr) {
      console.error('DB Connection Error:', dbErr)
      return NextResponse.json({ error: 'Database tidak terhubung' }, { status: 500 })
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 })
    }

    console.log('Login attempt for:', username)
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      console.log('User not found:', username)
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 })
    }

    console.log('User found, verifying password...')
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.log('Invalid password for:', username)
      return NextResponse.json({ error: 'Kredensial tidak valid' }, { status: 401 })
    }

    console.log('Password valid, setting session...')
    const userData = { id: user.id, username: user.username, name: user.name, role: user.role }
    await setSession(userData)

    console.log('Login successful for:', username)
    return NextResponse.json({ success: true, user: userData })
  } catch (error) {
    console.error('Login error details:', error)
    return NextResponse.json({ error: 'Gagal melakukan login' }, { status: 500 })
  }
}
