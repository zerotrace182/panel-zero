'use client'

import { useState, useEffect } from 'react'

export default function DistributorDashboardPage() {
  const [stats, setStats] = useState<any>({
    balance: 0,
    totalKeys: 0,
    activeKeys: 0,
    expiredKeys: 0,
    bannedKeys: 0,
    isActive: true,
  })
  const [prices, setPrices] = useState<any[]>([])
  const [myKeys, setMyKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || role !== 'distributor') {
      window.location.href = '/login'
      return
    }
    setUsername(localStorage.getItem('panel_user') || '')
    loadStats()
    loadPrices()
  }, [])

  async function loadStats() {
    setLoading(true)
    setError('')
    try {
      const username = localStorage.getItem('panel_user')
      const res = await fetch(`/api/distributor/stats?username=${username}`)
      const data = await res.json()
      if (data.status === 'success') {
        setStats(data.stats)
        setMyKeys(data.keys || [])

        // تحقق من الحساب المعطل
        if (data.stats && data.stats.isActive === false) {
          localStorage.setItem('panel_banned', 'true')
        }
      } else {
        setError(data.message || 'خطأ')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function loadPrices() {
    try {
      const res = await fetch('/api/admin/prices')
      const data = await res.json()
      if (data.status === 'success') {
        setPrices(data.prices || [])
      }
    } catch (e) {}
  }

  function handleLogout() {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(33,150,243,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(33,150,243,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #2196F3',
          borderRadius: '20px',
          padding: '35px 25px 30px',
          marginBottom: '30px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 15px 50px rgba(0,0,0,0.8), 0 0 60px rgba(33,150,243,0.15)'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '25px',
            background: 'rgba(33,150,243,0.1)',
            border: '1px solid rgba(33,150,243,0.5)',
            color: '#64B5F6',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: '30px'
          }}>🎯 {username} (Distributor)</div>

          <div style={{ fontSize: '52px' }}>🎯</div>

          <h1 style={{
            fontSize: '32px',
            letterSpacing: '6px',
            color: '#2196F3',
            marginTop: '10px'
          }}>DISTRIBUTOR</h1>

          <p style={{ color: '#64B5F6', fontSize: '11px', letterSpacing: '8px', marginTop: '8px' }}>
            RESELLER PANEL
          </p>
        </div>

        {/* Balance Card */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #4CAF50',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 15px 50px rgba(76,175,80,0.15)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💰</div>
          <div style={{ color: '#999', fontSize: '12px', letterSpacing: '3px', marginBottom: '8px' }}>
            YOUR BALANCE
          </div>
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#66bb6a',
            letterSpacing: '2px'
          }}>
            ${parseFloat(stats.balance || 0).toFixed(2)}
          </div>
          <div style={{ color: '#666', fontSize: '11px', marginTop: '10px' }}>
            ⚠️ لا يمكن استرجاع الرصيد — استخدمه لإنشاء أكواد
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '18px',
          marginBottom: '30px'
        }}>
          {[
            { icon: '🔑', value: stats.totalKeys || 0, label: 'MY KEYS', color: '#d4af37' },
            { icon: '✅', value: stats.activeKeys || 0, label: 'ACTIVE', color: '#66bb6a' },
            { icon: '⏰', value: stats.expiredKeys || 0, label: 'EXPIRED', color: '#ffa726' },
            { icon: '🚫', value: stats.bannedKeys || 0, label: 'BANNED', color: '#ef5350' }
          ].map((s, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '16px',
              padding: '25px 15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: s.color, marginBottom: '5px' }}>{s.value}</div>
              <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <a href="/dashboard/create" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'linear-gradient(135deg, #2196F3, #64B5F6)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>✦ إنشاء مفتاح ✦</a>

          <a href="/dashboard/distributor/my-keys" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#64B5F6',
            border: '1px solid rgba(33,150,243,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>🔑 مفاتيحي</a>

          <a href="/dashboard/distributor/prices" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#64B5F6',
            border: '1px solid rgba(33,150,243,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>💵 الأسعار</a>

          <a href="/dashboard/distributor/transactions" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#64B5F6',
            border: '1px solid rgba(33,150,243,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>📊 معاملاتي</a>

          <button onClick={handleLogout} style={{
            padding: '14px 26px',
            background: 'transparent',
            color: '#e57373',
            border: '1px solid rgba(229,115,115,0.5)',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer'
          }}>🚪 خروج</button>
        </div>

        {/* Prices Quick View */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '25px'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(212,175,55,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#d4af37', fontSize: '18px', letterSpacing: '3px' }}>
              💵 أسعار الأكواد
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            padding: '20px'
          }}>
            {prices.map((p) => (
              <div key={p.duration_type} style={{
                background: 'rgba(212,175,55,0.05)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{ color: '#999', fontSize: '10px', marginBottom: '5px' }}>
                  {p.duration_type}
                </div>
                <div style={{ color: '#66bb6a', fontSize: '16px', fontWeight: 700 }}>
                  ${parseFloat(p.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
