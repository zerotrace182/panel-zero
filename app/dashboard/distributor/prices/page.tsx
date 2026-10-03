'use client'

import { useState, useEffect } from 'react'

export default function DistributorPricesPage() {
  const [prices, setPrices] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || role !== 'distributor') {
      window.location.href = '/login'
      return
    }
    loadPrices()
  }, [])

  async function loadPrices() {
    try {
      const username = localStorage.getItem('panel_user')
      const [resPrices, resStats] = await Promise.all([
        fetch('/api/admin/prices'),
        fetch(`/api/distributor/stats?username=${username}`),
      ])

      const dataPrices = await resPrices.json()
      const dataStats = await resStats.json()

      if (dataPrices.status === 'success') setPrices(dataPrices.prices || [])
      if (dataStats.status === 'success') setBalance(dataStats.stats.balance || 0)
    } catch (e) {}
    setLoading(false)
  }

  const typeLabels: Record<string, string> = {
    day1: '📅 يوم واحد',
    day3: '📅 3 أيام',
    week1: '📆 أسبوع',
    month1: '🗓️ شهر',
    month2: '🗓️ شهران',
    month3: '🗓️ 3 أشهر',
    month6: '🗓️ 6 أشهر',
    year1: '🗓️ سنة',
    forever: '♾️ دائم',
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(33,150,243,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(33,150,243,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <a href="/dashboard/distributor" style={{
          color: '#64B5F6',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'inline-block',
          marginBottom: '20px'
        }}>← العودة للوحة</a>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #2196F3',
          borderRadius: '20px',
          padding: '30px 25px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💵</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#2196F3', marginBottom: '8px' }}>
            الأسعار
          </h1>
          <p style={{ color: '#64B5F6', fontSize: '11px', letterSpacing: '6px' }}>
            PRICE LIST
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #4CAF50',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px', marginBottom: '5px' }}>
            رصيدك الحالي
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#66bb6a' }}>
            ${balance.toFixed(2)}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            جاري التحميل...
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '2px solid rgba(33,150,243,0.4)',
            borderRadius: '20px',
            padding: '20px'
          }}>
            {prices.map((p) => (
              <div key={p.duration_type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                borderBottom: '1px solid rgba(33,150,243,0.15)',
                marginBottom: '10px'
              }}>
                <div style={{ color: '#e8e8e8', fontSize: '14px' }}>
                  {typeLabels[p.duration_type] || p.duration_type}
                </div>
                <div style={{
                  color: '#66bb6a',
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: 'monospace'
                }}>
                  ${parseFloat(p.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}
