'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { Plus, ShoppingCart, Trash2, User, Search } from 'lucide-react'

interface Product { id: number; name: string; sellingPrice: number; brand: { name: string }; inventory: Array<{ qty: number }> }
interface CartItem { productId: number; qty: number; name: string; price: number }
interface Customer { id: number; name: string; phone: string | null; vipTier: string }
interface Transaction {
  id: number; timestamp: string; totalAmount: number; paymentMethod: string; channel: string;
  customer?: { name: string } | null;
  items: Array<{ qty: number; unitPrice: number; margin: number; product: { name: string; brand: { name: string } } }>
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showPOS, setShowPOS] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchProd, setSearchProd] = useState('')
  const [searchCust, setSearchCust] = useState('')
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null)
  const [payMethod, setPayMethod] = useState('Cash')
  const [channel, setChannel] = useState('In-Store')
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [userRole, setUserRole] = useState('CASHIER')

  const fetchTx = () => {
    setLoading(true)
    fetch(`/api/transactions?page=${page}&limit=15`)
      .then(r => r.json())
      .then(d => { 
        setTransactions(d.transactions || [])
        setTotal(d.total || 0)
        setLoading(false)
      })
  }

  const fetchProducts = () => {
    fetch('/api/inventory').then(r => r.json()).then(d => setProducts((d || []).filter((p: any) => p.qty > 0).map((p: any) => ({
      id: p.productId, name: p.name, sellingPrice: p.sellingPrice, brand: { name: p.brand }, inventory: [{ qty: p.qty }]
    }))))
  }

  const fetchCustomers = () => {
    fetch(`/api/customers?q=${searchCust}`).then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : []))
  }

  useEffect(() => { fetchTx() }, [page])
  useEffect(() => { if (showPOS) fetchProducts() }, [showPOS])
  useEffect(() => { if (showPOS) fetchCustomers() }, [showPOS, searchCust])

  // Fetch role from dashboard (or simple session api)
  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => setUserRole(d.userRole || 'CASHIER'))
  }, [])

  const addToCart = (prod: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.productId === prod.id)
      if (existing) return prev.map(c => c.productId === prod.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { productId: prod.id, qty: 1, name: prod.name, price: prod.sellingPrice }]
    })
  }

  const removeFromCart = (productId: number) => setCart(prev => prev.filter(c => c.productId !== productId))
  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return }
    setCart(prev => prev.map(c => c.productId === productId ? { ...c, qty } : c))
  }

  const submitTx = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        paymentMethod: payMethod, 
        channel, 
        customerId: selectedCust?.id,
        items: cart.map(c => ({ productId: c.productId, qty: c.qty })) 
      }),
    })
    setSubmitting(false)
    setShowPOS(false)
    setCart([])
    setSelectedCust(null)
    fetchTx()
  }

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const filteredProds = products.filter(p => p.name.toLowerCase().includes(searchProd.toLowerCase()))
  const totalPages = Math.ceil(total / 15)

  return (
    <>
      <Header title="Transaksi" subtitle="Pencatatan penjualan & riwayat" userRole={userRole} />
      <div className="page-content">
        <div className="section-header mb-6">
          <div className="section-title">
            <ShoppingCart size={16} className="text-gold" />
            Total {total} Transaksi
          </div>
          <button className="btn btn-primary" onClick={() => setShowPOS(true)}>
            <Plus size={15} /> Transaksi Baru
          </button>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><span>Memuat...</span></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Tanggal</th><th>Item</th><th>Pelanggan</th><th>Metode</th>{userRole === 'ADMIN' && <th>Margin</th>}<th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td><span className="font-mono text-gold text-xs">TRX-{tx.id.toString().padStart(4,'0')}</span></td>
                      <td className="text-xs">{new Date(tx.timestamp).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                      <td>
                        {tx.items.slice(0,2).map((it, i) => (
                          <div key={i} className="text-xs text-muted" style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:180 }}>{it.qty}x {it.product.name}</div>
                        ))}
                        {tx.items.length > 2 && <div className="text-xs text-muted">+{tx.items.length - 2} lagi</div>}
                      </td>
                      <td>
                        {tx.customer ? (
                          <div className="flex items-center gap-1 text-xs">
                            <User size={10} className="text-gold" /> {tx.customer.name}
                          </div>
                        ) : <span className="text-muted text-xs">—</span>}
                      </td>
                      <td><span className="badge badge-regular">{tx.paymentMethod}</span></td>
                      {userRole === 'ADMIN' && <td style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>{fmt(tx.items.reduce((s,i)=>s+i.margin,0))}</td>}
                      <td style={{ color:'var(--gold-light)', fontWeight:600 }}>{fmt(tx.totalAmount)}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>Belum ada transaksi</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination" style={{ padding:'12px 16px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </div>

        {/* POS Modal */}
        {showPOS && (
          <div className="modal-overlay" onClick={() => setShowPOS(false)}>
            <div className="modal-box" style={{ maxWidth: 900 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Kasir (POS) — Transaksi Baru</div>
                <button className="modal-close" onClick={() => setShowPOS(false)}>✕</button>
              </div>
              <div className="grid-3" style={{ gap: 20 }}>
                {/* Produk */}
                <div>
                  <div className="form-group">
                    <label className="form-label">Cari Produk</label>
                    <div className="search-box" style={{ padding: '0 10px' }}>
                      <Search size={14} />
                      <input className="form-input" style={{ border: 'none', background: 'transparent' }} placeholder="Nama produk..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
                    </div>
                  </div>
                  <div style={{ maxHeight: 350, overflowY: 'auto', paddingRight: 5 }}>
                    {filteredProds.slice(0,20).map(p => (
                      <div key={p.id} className="pos-item" style={{ cursor:'pointer', marginBottom:6 }} onClick={() => addToCart(p)}>
                        <div>
                          <div className="pos-item-name" style={{ fontSize:'0.75rem' }}>{p.name}</div>
                          <div className="text-xs text-muted">{p.brand.name}</div>
                        </div>
                        <span className="pos-item-price" style={{ fontSize: '0.75rem' }}>{fmt(p.sellingPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pelanggan & Cart */}
                <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', padding: '0 15px' }}>
                  <div className="form-group">
                    <label className="form-label">Pilih Pelanggan (Opsional)</label>
                    {selectedCust ? (
                      <div className="pos-item" style={{ background: 'var(--gold-glow)', borderColor: 'var(--gold-muted)' }}>
                        <div style={{ flex: 1 }}>
                          <div className="text-sm font-semibold text-gold">{selectedCust.name}</div>
                          <div className="text-xs text-muted">{selectedCust.vipTier} Tier</div>
                        </div>
                        <button className="modal-close" style={{ position: 'static', fontSize: 14 }} onClick={() => setSelectedCust(null)}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div className="search-box mb-2" style={{ padding: '0 10px' }}>
                          <Search size={14} />
                          <input className="form-input" style={{ border: 'none', background: 'transparent' }} placeholder="Cari nama pelanggan..." value={searchCust} onChange={e => setSearchCust(e.target.value)} />
                        </div>
                        <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                          {customers.slice(0, 5).map(c => (
                            <div key={c.id} className="pos-item" style={{ cursor: 'pointer', marginBottom: 4, padding: '6px 10px' }} onClick={() => setSelectedCust(c)}>
                              <div className="text-xs font-medium">{c.name}</div>
                              <div className="text-xs text-muted">{c.vipTier}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="form-label mt-4 mb-2">Keranjang ({cart.length} item)</div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.productId} className="pos-item" style={{ marginBottom:6, padding: '8px 10px' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="pos-item-name" style={{ fontSize:'0.7rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</div>
                          <div className="text-xs text-muted">{fmt(item.price)}</div>
                        </div>
                        <div className="pos-qty-ctrl">
                          <button className="pos-qty-btn" onClick={() => updateQty(item.productId, item.qty - 1)}>−</button>
                          <span className="pos-qty" style={{ fontSize: 12 }}>{item.qty}</span>
                          <button className="pos-qty-btn" onClick={() => updateQty(item.productId, item.qty + 1)}>+</button>
                          <button className="pos-qty-btn" onClick={() => removeFromCart(item.productId)} style={{ color:'var(--accent-rose)' }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ringkasan & Submit */}
                <div>
                  <div className="card" style={{ background: 'var(--bg-secondary)', marginBottom: 15 }}>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted text-xs">Subtotal</span>
                      <span className="text-sm">{fmt(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-muted text-xs">Diskon</span>
                      <span className="text-sm text-emerald">Rp 0</span>
                    </div>
                    <div className="flex justify-between" style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-gold text-lg">{fmt(cartTotal)}</span>
                    </div>
                  </div>

                  <div className="grid-2 mb-4" style={{ gap:10 }}>
                    <div>
                      <label className="form-label">Pembayaran</label>
                      <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                        {['Cash','Card','Transfer','QRIS'].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Channel</label>
                      <select className="form-select" value={channel} onChange={e => setChannel(e.target.value)}>
                        <option>In-Store</option><option>Online</option>
                      </select>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', height: 48, fontSize: '0.95rem' }}
                    onClick={submitTx} disabled={submitting || cart.length === 0}>
                    {submitting ? 'Memproses...' : `Bayar Sekarang`}
                  </button>
                  <p className="text-center text-xs text-muted mt-3">Transaksi akan otomatis memotong stok dan mengupdate data CRM.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
