'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, PieChart, Pie,
} from 'recharts'
import {
  TrendingUp, Package, Tag, Handshake, AlertTriangle, DollarSign, BarChart2, Gem, PieChart as PieChartIcon, Trophy,
} from 'lucide-react'

const COLORS = ['#c9a84c', '#7c3aed', '#10b981', '#f43f5e', '#f59e0b', '#3b82f6']

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const fmtNum = (n: number) => new Intl.NumberFormat('id-ID').format(n)

interface DashboardData {
  kpi: {
    totalBrands: number
    totalProducts: number
    totalStock: number
    consignmentLiability: number
    monthRevenue: number
    monthMargin: number
    pendingSettlementsCount: number
    pendingSettlementsAmount: number
  }
  recentTransactions: Array<{
    id: number
    timestamp: string
    totalAmount: number
    paymentMethod: string
    channel: string
    items: Array<{ qty: number; product: { name: string; brand: { name: string } } }>
  }>
  monthlySales: Array<{ month: string; revenue: number; txCount: number }>
  salesByCategory: Array<{ category: string; revenue: number }>
  topBrands: Array<{ brand: string; revenue: number }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData & { userRole?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="page-content">
        <Header title="Dashboard" subtitle="Overview performa butik Anda" />
        <div className="loading-state"><div className="spinner" /><span>Memuat data...</span></div>
      </div>
    )
  }

  const kpi = data?.kpi
  const userRole = data?.userRole || 'CASHIER'
  const monthlySales = (data?.monthlySales || []).map(m => ({
    ...m,
    revenue: Number(m.revenue),
    month: m.month,
  }))
  const salesByCategory = (data?.salesByCategory || []).map(c => ({
    ...c,
    revenue: Number(c.revenue)
  }))
  const topBrands = (data?.topBrands || []).map(b => ({
    ...b,
    revenue: Number(b.revenue)
  }))

  return (
    <>
      <Header title="Dashboard" subtitle="Overview performa butik Anda" userRole={userRole} />
      <div className="page-content">

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card kpi-gold">
            <div className="kpi-icon kpi-icon-gold"><DollarSign size={18} /></div>
            <div className="kpi-label">Revenue Bulan Ini</div>
            <div className="kpi-value">{fmt(kpi?.monthRevenue || 0)}</div>
            <div className="kpi-sub">Pendapatan kotor periode ini</div>
          </div>
          
          {userRole === 'ADMIN' && (
            <div className="kpi-card kpi-emerald">
              <div className="kpi-icon kpi-icon-emerald"><TrendingUp size={18} /></div>
              <div className="kpi-label">Margin Bulan Ini</div>
              <div className="kpi-value">{fmt(kpi?.monthMargin || 0)}</div>
              <div className="kpi-sub">
                {kpi?.monthRevenue ? `${((kpi.monthMargin / kpi.monthRevenue) * 100).toFixed(1)}% dari revenue` : '–'}
              </div>
            </div>
          )}

          <div className="kpi-card kpi-blue">
            <div className="kpi-icon kpi-icon-blue"><Package size={18} /></div>
            <div className="kpi-label">Total Stok</div>
            <div className="kpi-value">{fmtNum(kpi?.totalStock || 0)}</div>
            <div className="kpi-sub">{kpi?.totalProducts || 0} produk aktif</div>
          </div>

          {userRole === 'ADMIN' && (
            <div className="kpi-card kpi-rose">
              <div className="kpi-icon kpi-icon-rose"><AlertTriangle size={18} /></div>
              <div className="kpi-label">Liabilitas Konsinyasi</div>
              <div className="kpi-value">{fmt(kpi?.consignmentLiability || 0)}</div>
              <div className="kpi-sub">Nilai stok titip jual</div>
            </div>
          )}

          {userRole === 'ADMIN' && (
            <div className="kpi-card kpi-purple">
              <div className="kpi-icon kpi-icon-purple"><Tag size={18} /></div>
              <div className="kpi-label">Total Brand</div>
              <div className="kpi-value">{kpi?.totalBrands || 0}</div>
              <div className="kpi-sub">Partner aktif</div>
            </div>
          )}

          {userRole === 'ADMIN' && (
            <div className="kpi-card kpi-amber">
              <div className="kpi-icon kpi-icon-amber"><Handshake size={18} /></div>
              <div className="kpi-label">Pending Settlement</div>
              <div className="kpi-value">{kpi?.pendingSettlementsCount || 0}</div>
              <div className="kpi-sub">{fmt(kpi?.pendingSettlementsAmount || 0)} harus dibayar</div>
            </div>
          )}

          {userRole === 'CASHIER' && (
            <div className="kpi-card kpi-purple">
              <div className="kpi-icon kpi-icon-purple"><Tag size={18} /></div>
              <div className="kpi-label">Tipe Katalog</div>
              <div className="kpi-value">{kpi?.totalProducts || 0}</div>
              <div className="kpi-sub">Koleksi butik saat ini</div>
            </div>
          )}
        </div>

        {/* First Row of Charts */}
        <div className="grid-2 mb-6">
          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <BarChart2 size={16} className="text-gold" />
                Tren Penjualan (6 Bulan)
              </div>
            </div>
            {monthlySales.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlySales}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#52525b" tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
                    <Tooltip
                      formatter={(v: any) => [fmt(Number(v)), 'Revenue']}
                      contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#c9a84c" strokeWidth={2}
                      fill="url(#goldGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">Belum ada data penjualan</div></div>
            )}
          </div>

          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <PieChartIcon size={16} className="text-gold" />
                Distribusi Kategori (Bulan Ini)
              </div>
            </div>
            {salesByCategory.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: any) => [fmt(Number(v)), 'Revenue']}
                      contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🥧</div><div className="empty-state-text">Belum ada data kategori</div></div>
            )}
          </div>
        </div>

        {/* Second Row of Charts */}
        <div className="grid-2 mb-6">
          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <Trophy size={16} className="text-gold" />
                Top 5 Brand Terlaris (Bulan Ini)
              </div>
            </div>
            {topBrands.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBrands} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" stroke="#52525b" tick={{ fontSize: 11 }} hide />
                    <YAxis dataKey="brand" type="category" stroke="#52525b" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip
                      formatter={(v: any) => [fmt(Number(v)), 'Revenue']}
                      contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    />
                    <Bar dataKey="revenue" fill="#c9a84c" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🏆</div><div className="empty-state-text">Belum ada data brand</div></div>
            )}
          </div>

          <div className="card">
            <div className="section-header">
              <div className="section-title">
                <Gem size={16} className="text-gold" />
                Jumlah Transaksi per Bulan
              </div>
            </div>
            {monthlySales.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#52525b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v: any) => [v, 'Transaksi']}
                      contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                    />
                    <Bar dataKey="txCount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">📈</div><div className="empty-state-text">Belum ada data</div></div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Transaksi Terkini</div>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Tanggal</th>
                  <th>Item</th>
                  <th>Metode</th>
                  <th>Channel</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(data?.recentTransactions || []).map(tx => (
                  <tr key={tx.id}>
                    <td><span className="font-mono text-gold">TRX-{tx.id.toString().padStart(4, '0')}</span></td>
                    <td>{new Date(tx.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <div style={{ maxWidth: 220 }}>
                        {tx.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-xs" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.product.name}
                          </div>
                        ))}
                        {tx.items.length > 2 && <div className="text-xs text-muted">+{tx.items.length - 2} lainnya</div>}
                      </div>
                    </td>
                    <td><span className="badge badge-regular">{tx.paymentMethod}</span></td>
                    <td><span className="badge badge-healthy">{tx.channel}</span></td>
                    <td style={{ color: 'var(--gold-light)', fontWeight: 600 }}>{fmt(tx.totalAmount)}</td>
                  </tr>
                ))}
                {(!data?.recentTransactions || data.recentTransactions.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Belum ada transaksi</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  )
}
