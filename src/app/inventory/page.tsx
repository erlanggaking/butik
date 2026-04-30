'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Package, Search, AlertTriangle, CheckCircle, Eye } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

interface InventoryItem {
  id: number; productId: number; sku: string; name: string; category: string;
  brand: string; brandType: string; basePrice: number; sellingPrice: number;
  qty: number; location: string; daysWithoutSale: number;
  aiLabel: 'Clearance Candidate' | 'Monitor' | 'Healthy'; stockValue: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editQty, setEditQty] = useState(0)
  const [editLocation, setEditLocation] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (type) params.set('type', type)
    fetch(`/api/inventory?${params}`)
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [search, category, type])

  const saveEdit = async () => {
    if (!editItem) return
    setSaving(true)
    await fetch('/api/inventory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryId: editItem.id, qty: editQty, location: editLocation }),
    })
    setSaving(false)
    setEditItem(null)
    fetchData()
  }

  const clearanceCnt = items.filter(i => i.aiLabel === 'Clearance Candidate').length
  const totalValue = items.reduce((s, i) => s + i.stockValue, 0)

  return (
    <>
      <Header title="Inventaris" subtitle={`${items.length} produk terdaftar`} />
      <div className="page-content">
        <div className="kpi-grid mb-6" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon kpi-icon-blue"><Package size={18} /></div>
            <div className="kpi-label">Total Item</div>
            <div className="kpi-value">{items.length}</div>
          </div>
          <div className="kpi-card kpi-gold">
            <div className="kpi-icon kpi-icon-gold"><Package size={18} /></div>
            <div className="kpi-label">Nilai Stok</div>
            <div className="kpi-value" style={{ fontSize: '1.05rem' }}>{fmt(totalValue)}</div>
          </div>
          <div className="kpi-card kpi-rose">
            <div className="kpi-icon kpi-icon-rose"><AlertTriangle size={18} /></div>
            <div className="kpi-label">Clearance</div>
            <div className="kpi-value">{clearanceCnt}</div>
          </div>
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon kpi-icon-amber"><Eye size={18} /></div>
            <div className="kpi-label">Monitor</div>
            <div className="kpi-value">{items.filter(i => i.aiLabel === 'Monitor').length}</div>
          </div>
        </div>

        <div className="filters-bar mb-4">
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="filter-input" style={{ paddingLeft: 32, width: '100%' }}
              placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {['Handbag','Shoes','Accessories','Outerwear','Dress'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>
            <option value="">Semua Tipe</option>
            <option value="REGULAR">Regular</option>
            <option value="CONSIGNMENT">Konsinyasi</option>
          </select>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><span>Memuat...</span></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th><th>Produk</th><th>Kategori</th><th>Brand</th>
                    <th>Tipe</th><th>Harga Jual</th><th>Stok</th><th>Hari Diam</th><th>AI Status</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td><span className="font-mono text-xs">{item.sku}</span></td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</td>
                      <td>{item.category}</td>
                      <td style={{ fontWeight: 500 }}>{item.brand}</td>
                      <td>
                        <span className={`badge ${item.brandType === 'CONSIGNMENT' ? 'badge-consignment' : 'badge-regular'}`}>
                          {item.brandType === 'CONSIGNMENT' ? 'Konsinyasi' : 'Regular'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{fmt(item.sellingPrice)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: item.qty <= 2 ? 'var(--accent-rose)' : item.qty <= 5 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                          {item.qty}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: item.daysWithoutSale > 30 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                          {item.daysWithoutSale}d
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${item.aiLabel === 'Clearance Candidate' ? 'badge-clearance' : item.aiLabel === 'Monitor' ? 'badge-monitor' : 'badge-healthy'}`}>
                          {item.aiLabel === 'Clearance Candidate' && <AlertTriangle size={10} />}
                          {item.aiLabel === 'Healthy' && <CheckCircle size={10} />}
                          {item.aiLabel}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditItem(item); setEditQty(item.qty); setEditLocation(item.location) }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {editItem && (
          <div className="modal-overlay" onClick={() => setEditItem(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Edit Stok</div>
                <button className="modal-close" onClick={() => setEditItem(null)}>✕</button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 18 }}>{editItem.name}</p>
              <div className="form-group">
                <label className="form-label">Jumlah Stok</label>
                <input className="form-input" type="number" min={0} value={editQty} onChange={e => setEditQty(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Lokasi</label>
                <input className="form-input" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
                <button className="btn btn-secondary" onClick={() => setEditItem(null)}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
