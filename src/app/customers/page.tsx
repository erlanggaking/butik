'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Users, Plus, Search, Mail, Phone, Crown, ShoppingBag } from 'lucide-react'

interface Customer {
  id: number; name: string; phone: string | null; email: string | null;
  vipTier: string; totalSpent: number; preferences: string | null;
  _count: { transactions: number }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', preferences: '' })

  const fetchCustomers = () => {
    setLoading(true)
    fetch(`/api/customers?q=${search}`)
      .then(r => r.json())
      .then(d => { setCustomers(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...formData, id: editing.id } : formData

    await fetch('/api/customers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    setShowModal(false)
    setEditing(null)
    setFormData({ name: '', phone: '', email: '', preferences: '' })
    fetchCustomers()
  }

  const openEdit = (c: Customer) => {
    setEditing(c)
    setFormData({ name: c.name, phone: c.phone || '', email: c.email || '', preferences: c.preferences || '' })
    setShowModal(true)
  }

  return (
    <>
      <Header title="CRM Pelanggan" subtitle="Manajemen basis data pembeli & loyalitas" />
      <div className="page-content">
        <div className="section-header mb-6">
          <div className="search-box">
            <Search size={18} />
            <input 
              placeholder="Cari nama, nomor HP, atau email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
            <Plus size={16} /> Pelanggan Baru
          </button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><span>Memuat data...</span></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Kontak</th>
                    <th>VIP Tier</th>
                    <th>Total Belanja</th>
                    <th>Kunjungan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                        <div className="text-xs text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.preferences || 'Tidak ada catatan'}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <Phone size={12} className="text-muted" /> {c.phone || '-'}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail size={12} className="text-muted" /> {c.email || '-'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${c.vipTier.toLowerCase()}`}>
                          <Crown size={10} /> {c.vipTier}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--gold-light)' }}>{fmt(c.totalSpent)}</td>
                      <td>
                        <div className="flex items-center gap-1 text-sm">
                          <ShoppingBag size={14} className="text-muted" /> {c._count.transactions}
                        </div>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Profil Pelanggan' : 'Tambah Pelanggan Baru'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input 
                  className="form-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Nomor HP</label>
                  <input 
                    className="form-input" 
                    value={formData.phone} 
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-group mb-6">
                <label className="form-label">Preferensi / Catatan</label>
                <textarea 
                  className="form-input" 
                  rows={3} 
                  style={{ resize: 'none' }} 
                  placeholder="Misal: Suka warna pastel, ukuran M..."
                  value={formData.preferences} 
                  onChange={e => setFormData({ ...formData, preferences: e.target.value })} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {editing ? 'Simpan Perubahan' : 'Daftarkan Pelanggan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
