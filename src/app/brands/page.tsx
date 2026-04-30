'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Tag, Plus, Star } from 'lucide-react'

interface Brand {
  id: number; name: string; type: string; commissionRate: number;
  productCount: number; totalStock: number; totalSold: number;
  totalRevenue: number; score: number; turnoverRate: number; marginRate: number; rank: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'REGULAR', commissionRate: '0' })
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/brands').then(r => r.json()).then(d => { setBrands(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const saveAdd = async () => {
    setSaving(true)
    await fetch('/api/brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, commissionRate: Number(form.commissionRate) / 100 }),
    })
    setSaving(false)
    setShowAdd(false)
    setForm({ name: '', type: 'REGULAR', commissionRate: '0' })
    fetchData()
  }

  const getRankClass = (rank: number) => rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-n'

  return (
    <>
      <Header title="Manajemen Brand" subtitle="Master data brand & performa" />
      <div className="page-content">
        <div className="section-header mb-6">
          <div className="section-title">
            <Tag size={16} className="text-gold" />
            {brands.length} Brand Aktif
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={15} /> Tambah Brand
          </button>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Memuat brand...</span></div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th><th>Brand</th><th>Tipe</th><th>Komisi</th>
                    <th>Produk</th><th>Stok</th><th>Terjual</th><th>Revenue</th>
                    <th>Turnover</th><th>Margin Rate</th><th>AI Score</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div className={`rank-badge ${getRankClass(b.rank)}`}>
                          {b.rank <= 3 ? <Star size={11} fill="currentColor" /> : b.rank}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</td>
                      <td>
                        <span className={`badge ${b.type === 'CONSIGNMENT' ? 'badge-consignment' : 'badge-regular'}`}>
                          {b.type === 'CONSIGNMENT' ? 'Konsinyasi' : 'Regular'}
                        </span>
                      </td>
                      <td>{b.type === 'CONSIGNMENT' ? `${(b.commissionRate * 100).toFixed(0)}%` : '–'}</td>
                      <td>{b.productCount}</td>
                      <td>{b.totalStock}</td>
                      <td style={{ color: 'var(--accent-emerald)' }}>{b.totalSold}</td>
                      <td style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{fmt(b.totalRevenue)}</td>
                      <td>{b.turnoverRate}%</td>
                      <td>{b.marginRate}%</td>
                      <td>
                        <div className="score-bar-wrap">
                          <div className="score-bar-track">
                            <div className="score-bar-fill" style={{ width: `${b.score}%` }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: b.score >= 70 ? 'var(--accent-emerald)' : b.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-rose)', minWidth: 28 }}>
                            {b.score}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="modal-overlay" onClick={() => setShowAdd(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Tambah Brand Baru</div>
                <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Brand</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama brand..." />
              </div>
              <div className="form-group">
                <label className="form-label">Tipe Kerjasama</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="REGULAR">Regular (Beli Putus)</option>
                  <option value="CONSIGNMENT">Konsinyasi (Titip Jual)</option>
                </select>
              </div>
              {form.type === 'CONSIGNMENT' && (
                <div className="form-group">
                  <label className="form-label">Komisi Brand (%)</label>
                  <input className="form-input" type="number" min={0} max={100} value={form.commissionRate}
                    onChange={e => setForm({ ...form, commissionRate: e.target.value })} />
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary" onClick={saveAdd} disabled={saving || !form.name}>
                  {saving ? 'Menyimpan...' : 'Tambah Brand'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
