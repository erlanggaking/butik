'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Handshake,
  BrainCircuit,
  Users,
  Gem
} from 'lucide-react'

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'CASHIER'] },
  { href: '/inventory', icon: Package, label: 'Inventaris', roles: ['ADMIN', 'CASHIER'] },
  { href: '/transactions', icon: ShoppingCart, label: 'Transaksi', roles: ['ADMIN', 'CASHIER'] },
  { href: '/customers', icon: Users, label: 'Pelanggan', roles: ['ADMIN', 'CASHIER'] },
  { href: '/brands', icon: Tag, label: 'Brand', roles: ['ADMIN'] },
  { href: '/settlements', icon: Handshake, label: 'Settlement', roles: ['ADMIN'] },
  { href: '/ai-insights', icon: BrainCircuit, label: 'AI Insights', roles: ['ADMIN'] },
]

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const role = userRole || 'CASHIER'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Gem size={22} />
        </div>
        <div>
          <div className="logo-title">BUTIK</div>
          <div className="logo-sub">Inventory System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.filter(item => item.roles.includes(role)).map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-badge">
          <BrainCircuit size={12} />
          <span>AI Powered</span>
        </div>
      </div>
    </aside>
  )
}
