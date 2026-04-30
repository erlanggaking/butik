'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { BrainCircuit, AlertTriangle, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

interface SlowMover {
  productId: number; productName: string; sku: string; category: string;
  brandName: string; brandType: string; daysWithoutSale: number; qty: number;
  sellingPrice: number; label: string;
}
interface DemandForecast {
  category: string; currentMonth: number; nextMonth: number; trend: string; reason: string;
}
interface BrandScore {
  brandId: number; brandName: string; type: string; score: number;
  turnoverRate: number; marginRate: number; rank: number;
}
interface InsightsData {
  slowMovers: { clearanceCandidates: SlowMover[]; monitors: SlowMover[]; totalSlowMovers: number };
  demandForecast: DemandForecast[];
  brandScores: BrandScore[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function AIInsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'slow' | 'demand' | 'brands'>('slow')

  useEffect(() => {
    fetch('/api/ai-insights').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <>
        <Header title="AI Insights" subtitle="Analitik cerdas berbasis AI" />
        <div className="page-content"><div className="loading-state"><div className="spinner" /><span>AI sedang menganalisis...</span></div></div>
      </>
    )
  }

  const radarData = (data?.demandForecast || []).map(d => ({
    category: d.category, Bulan_Ini: d.currentMonth, Bulan_Depan: d.nextMonth,
  }))

  const topBrands = (data?.brandScores || []).slice(0, 10)

  return (
    <>
      <Header title="AI Insights" subtitle="Analitik cerdas berbasis AI untuk keputusan bisnis optimal" />
      <div className="page-content">

        {/* AI Summary Banner */}
        <div className="insight-card mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="kpi-icon kpi-icon-gold" style={{ margin: 0 }}><BrainCircuit size={18} /></div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI Analysis Summary</div>
              <div className="text-xs text-muted">Diperbarui: {new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}</div>
            </div>
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            <div style={{ background: 'rgba(244,63,94,0.07)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(244,63,94,0.15)' }}>
              <div className="text-xs text-muted mb-1">Clearance Candidate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-rose)' }}>
                {data?.slowMovers.totalSlowMovers || 0}
              </div>
              <div className="text-xs text-muted">Produk &gt;30 hari tidak bergerak</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.07)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="text-xs text-muted mb-1">Kategori Paling Demand</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {data?.demandForecast.reduce((a, b) => a.nextMonth > b.nextMonth ? a : b)?.category || '–'}
              </div>
              <div className="text-xs text-muted">Prediksi bulan depan</div>
            </div>
            <div style={{ background: 'var(--gold-glow)', borderRadius: 8, padding: '12px 14px', border: '1px solid rgba(201,168,76,0.2)' }}>
              <div className="text-xs text-muted mb-1">Top Brand AI Score</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                {data?.brandScores[0]?.brandName || '–'}
              </div>
              <div className="text-xs text-muted">Score: {data?.brandScores[0]?.score || 0}/100</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'slow', label: '🔴 Slow-Mover Predictor' },
            { key: 'demand', label: '📈 Demand Forecast' },
            { key: 'brands', label: '🏆 Brand Ranking' },
          ].map(t => (
            <button
              key={t.key}
              className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t.key as 'slow' | 'demand' | 'brands')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Slow Movers Tab */}
        {tab === 'slow' && (
          <div>
            <div className="mb-4">
              <div className="section-title mb-3">
                <AlertTriangle size={15} style={{ color: 'var(--accent-rose)' }} />
                Clearance Candidates ({data?.slowMovers.clearanceCandidates.length || 0} produk)
              </div>
              <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Produk</th><th>Brand</th><th>Kategori</th><th>Stok</th><th>Hari Diam</th><th>Harga Jual</th><th>Tipe</th></tr>
                    </thead>
                    <tbody>
                      {(data?.slowMovers.clearanceCandidates || []).map(item => (
                        <tr key={item.productId}>
                          <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.productName}</td>
                          <td>{item.brandName}</td>
                          <td>{item.category}</td>
                          <td style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{item.qty}</td>
                          <td>
                            <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>{item.daysWithoutSale} hari</span>
                          </td>
                          <td style={{ color: 'var(--gold-light)' }}>{fmt(item.sellingPrice)}</td>
                          <td>
                            <span className={`badge ${item.brandType === 'CONSIGNMENT' ? 'badge-consignment' : 'badge-regular'}`}>
                              {item.brandType === 'CONSIGNMENT' ? 'Konsinyasi' : 'Regular'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {(!data?.slowMovers.clearanceCandidates || data.slowMovers.clearanceCandidates.length === 0) && (
                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>✅ Tidak ada clearance candidate</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demand Forecast Tab */}
        {tab === 'demand' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title mb-4">
                <TrendingUp size={15} className="text-gold" />
                Radar Forecast per Kategori
              </div>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
                    <Radar name="Bulan Ini" dataKey="Bulan_Ini" stroke="#c9a84c" fill="#c9a84c" fillOpacity={0.2} />
                    <Radar name="Bulan Depan" dataKey="Bulan_Depan" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="section-title mb-4">
                <TrendingUp size={15} className="text-gold" />
                Detail Prediksi
              </div>
              {(data?.demandForecast || []).map(f => (
                <div key={f.category} style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.category}</span>
                    <span className={f.trend === 'up' ? 'trend-up' : f.trend === 'down' ? 'trend-down' : 'trend-stable'}>
                      {f.trend === 'up' ? <TrendingUp size={14} /> : f.trend === 'down' ? <TrendingDown size={14} /> : <Minus size={14} />}
                    </span>
                  </div>
                  <div className="flex gap-3 mb-2">
                    <div><div className="text-xs text-muted">Bulan Ini</div><div style={{ fontWeight:700, color:'var(--gold-light)' }}>{f.currentMonth}</div></div>
                    <div><div className="text-xs text-muted">Bulan Depan</div><div style={{ fontWeight:700, color:'var(--accent-purple)' }}>{f.nextMonth}</div></div>
                  </div>
                  <div className="text-xs text-muted">{f.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Ranking Tab */}
        {tab === 'brands' && (
          <div className="grid-2">
            <div className="card">
              <div className="section-title mb-4">
                <Trophy size={15} className="text-gold" />
                Brand Performance Index
              </div>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topBrands} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis type="number" domain={[0, 100]} stroke="#52525b" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="brandName" stroke="#52525b" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip contentStyle={{ background: '#161618', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      formatter={(v: number) => [`${v}/100`, 'AI Score']} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}
                      fill="#c9a84c" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card" style={{ padding: 0 }}>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Brand</th><th>Score</th><th>Turnover</th><th>Margin</th></tr>
                  </thead>
                  <tbody>
                    {topBrands.map((b, i) => (
                      <tr key={b.brandId}>
                        <td>
                          <span style={{ fontSize: '0.9rem' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{b.brandName}</td>
                        <td>
                          <div className="score-bar-wrap">
                            <div className="score-bar-track" style={{ width: 60 }}>
                              <div className="score-bar-fill" style={{ width: `${b.score}%` }} />
                            </div>
                            <span style={{ fontWeight: 700, color: b.score >= 70 ? 'var(--accent-emerald)' : b.score >= 40 ? 'var(--accent-amber)' : 'var(--accent-rose)' }}>
                              {b.score}
                            </span>
                          </div>
                        </td>
                        <td>{b.turnoverRate}%</td>
                        <td>{b.marginRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
