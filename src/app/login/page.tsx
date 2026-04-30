'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gem, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal login')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justify: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div className="logo-icon" style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 16 }}>
            <Gem size={28} />
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.6rem', color: 'var(--gold-light)' }}>BUTIK</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inventory & Consignment System</p>
        </div>

        {error && (
          <div style={{ padding: 12, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: 'var(--accent-rose)', fontSize: '0.85rem', borderRadius: 8, marginBottom: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input" 
              placeholder="Masukkan username..." 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group mb-6">
            <label className="form-label">Password</label>
            <input 
              type="password"
              className="form-input" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
            disabled={loading}
          >
            <Lock size={16} />
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div>Admin: admin / admin123</div>
          <div>Kasir: kasir / kasir123</div>
        </div>

      </div>
    </div>
  )
}
