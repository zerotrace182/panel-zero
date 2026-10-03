'use client'

import { useState, useEffect } from 'react'

export default function AdminPricesPage() {
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || (role !== 'admin' && role !== 'owner')) {
      window.location.href = '/login'
      return
    }
    loadPrices()
  }, [])

  async function loadPrices() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/prices')
      const data = await res.json()
      if (data.status === 'success') setPrices(data.prices || [])
    } catch (e) {}
    setLoading(false)
  }

  function startEdit(duration_type: string, currentPrice: number) {
    setEditing(duration_type)
    setEditValue(String(currentPrice))
    setMessage('')
  }

  async function saveEdit(duration_type: string) {
    if (!editValue || parseFloat(editValue) < 0) {
      setMessage('❌ سعر غير صالح')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_type,
          price: parseFloat(editValue),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✅ تم التحديث')
        setEditing(null)
        loadPrices()
      } else {
        setMessage('❌ ' + (data.message || 'فشل'))
      }
    } catch (e: any) {
      setMessage('❌ ' + e.message)
    }
    setSaving(false)
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
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <a href="/dashboard/admin" style={{
          color: '#d4af37',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'inline-block',
          marginBottom: '20px'
        }}>← العودة للوحة</a>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #d4af37',
          borderRadius: '20px',
          padding: '30px 25px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💵</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#d4af37', marginBottom: '8px' }}>
            إدارة الأسعار
          </h1>
          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '6px' }}>
            PRICE MANAGEMENT
          </p>
        </div>

        {message && (
          <div style={{
            background: message.includes('✅') ? 'rgba(76,175,80,0.15)' : 'rgba(229,115,115,0.15)',
            border: message.includes('✅') ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(229,115,115,0.5)',
            color: message.includes('✅') ? '#66bb6a' : '#ef5350',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '13px'
          }}>{message}</div>
        )}

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '20px'
        }}>
          <p style={{
            color: '#999',
            fontSize: '12px',
            textAlign: 'center',
            marginBottom: '20px',
            lineHeight: 1.8
          }}>
            💡 عدّل سعر كل نوع — سيُخصم هذا السعر من رصيد الموزع عند كل إنشاء كود.
          </p>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : (
            prices.map((p) => (
              <div key={p.duration_type} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                borderBottom: '1px solid rgba(212,175,55,0.15)',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ color: '#e8e8e8', fontSize: '14px', flex: 1, minWidth: '120px' }}>
                  {typeLabels[p.duration_type] || p.duration_type}
                </div>

                {editing === p.duration_type ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      step={0.5}
                      min={0}
                      autoFocus
                      style={{
                        width: '100px',
                        padding: '8px',
                        background: '#0a0a0a',
                        border: '1px solid #d4af37',
                        borderRadius: '8px',
                        color: '#f4d03f',
                        fontSize: '14px',
                        outline: 'none',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}
                    />
                    <button
                      onClick={() => saveEdit(p.duration_type)}
                      disabled={saving}
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: saving ? 'wait' : 'pointer',
                        fontSize: '12px',
                        opacity: saving ? 0.6 : 1
                      }}
                    >{saving ? '...' : 'حفظ'}</button>
                    <button
                      onClick={() => setEditing(null)}
                      style={{
                        padding: '8px 14px',
                        background: 'transparent',
                        color: '#888',
                        border: '1px solid #555',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >إلغاء</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                      color: '#66bb6a',
                      fontSize: '18px',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      minWidth: '70px',
                      textAlign: 'center'
                    }}>
                      ${parseFloat(p.price).toFixed(2)}
                    </div>
                    <button
                      onClick={() => startEdit(p.duration_type, p.price)}
                      style={{
                        padding: '8px 14px',
                        background: 'transparent',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.6)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >✏️ تعديل</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}
