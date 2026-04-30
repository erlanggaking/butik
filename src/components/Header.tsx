import { Bell, Search, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title: string
  subtitle?: string
  userRole?: string
}

export default function Header({ title, subtitle, userRole = 'CASHIER' }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }
  return (
    <header className="page-header">
      <div className="header-left">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="header-right">
        <div className="header-search">
          <Search size={14} className="search-icon" />
          <input placeholder="Cari produk, brand..." className="search-input" />
        </div>
        <button className="notif-btn">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <div className="user-avatar" title={userRole}>
          <span>{userRole === 'ADMIN' ? 'AD' : 'KS'}</span>
        </div>
        <button onClick={handleLogout} className="notif-btn" title="Logout" style={{ color: 'var(--accent-rose)' }}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
