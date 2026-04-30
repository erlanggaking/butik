import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Butik — AI Inventory & Consignment System',
  description: 'Sistem manajemen inventaris berbasis AI untuk butik high-end.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  let user = null
  
  if (sessionCookie) {
    try {
      const session = await decrypt(sessionCookie)
      user = session?.user
    } catch (e) {}
  }

  return (
    <html lang="id">
      <body>
        {user ? (
          <div className="app-layout">
            <Sidebar userRole={user.role} />
            <main className="main-content">
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
