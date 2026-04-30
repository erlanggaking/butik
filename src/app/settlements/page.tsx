'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Handshake, CheckCircle, Clock } from 'lucide-react'

interface Settlement {
  id: number; brandId: number; period: string; totalSales: number;
  commissionAmount: number; status: string; paidAt: string | null;
  brand: { name: string; type: string; commissionRate: number }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchData = () => {
    setLoading(true)
    fetch('/api/settlements').then(r => r.json()).then(d => { setSettlements(Array.isArray(d) ? d : []); setLoading(false) })
  }

  useEffect(() => { fetchData() }, [])

  const markPaid = async (id: number) => {
    setUpdating(id)
    await fetch('/api/settlements', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'PAID' }),
    })
    setUpdating(null)
    fetchData()
  }

  const totalPending = settlements.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + s.commissionAmount, 0)
  const totalPaid = settlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.commissionAmount, 0)
  const pendingCount = settlements.filter(s => s.status === 'PENDING').length

  return (
    <>
      <Header title="Settlement Konsinyasi" subtitle="Kelola pembayaran ke brand titip jual" />
      <div className="page-content">
        <div className="kpi-grid mb-6" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <div className="kpi-card kpi-amber">
            <div className="kpi-icon kpi-icon-amber"><Clock size={18} /></div>
            <div className="kpi-label">Pending Settlement</div>
            <div className="kpi-value">{pendingCount}</div>
            <div className="kpi-sub">{fmt(totalPending)} belum dibayar</div>
          </div>
          <div className="kpi-card kpi-emerald">
            <div className="kpi-icon kpi-icon-emerald"><CheckCircle size={18} /></div>
            <div className="kpi-label">Sudah Dibayar</div>
            <div className="kpi-value">{settlements.filter(s => s.status === 'PAID').length}</div>
            <div className="kpi-sub">{fmt(totalPaid)} terbayar</div>
          </div>
          <div className="kpi-card kpi-gold">
            <div className="kpi-icon kpi-icon-gold"><Handshake size={18} /></div>
            <div className="kpi-label">Total Komisi</div>
            <div className="kpi-value" style={{ fontSize: '1rem' }}>{fmt(totalPending + totalPaid)}</div>
            <div className="kpi-sub">Periode 2025-04</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><span>Memuat...</span></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Brand</th><th>Periode</th><th>Komisi %</th>
                    <th>Total Penjualan</th><th>Komisi Dibayar</th>
                    <th>Status</th><th>Tanggal Bayar</th><th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {settlements.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.brand.name}</td>
                      <td><span className="badge badge-regular">{s.period}</span></td>
                      <td style={{ color: 'var(--gold-light)' }}>{(s.brand.commissionRate * 100).toFixed(0)}%</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{fmt(s.totalSales)}</td>
                      <td style={{ fontWeight: 700, color: s.status === 'PENDING' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                        {fmt(s.commissionAmount)}
                      </td>
                      <td>
                        <span className={`badge ${s.status === 'PAID' ? 'badge-paid' : 'badge-pending'}`}>
                          {s.status === 'PAID' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {s.status === 'PAID' ? 'Lunas' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-xs text-muted">
                        {s.paidAt ? new Date(s.paidAt).toLocaleDateString('id-ID') : '–'}
                      </td>
                      <td>
                        {s.status === 'PENDING' ? (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => markPaid(s.id)}
                            disabled={updating === s.id}
                          >
                            <CheckCircle size={13} />
                            {updating === s.id ? 'Memproses...' : 'Mark Lunas'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada data settlement</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
