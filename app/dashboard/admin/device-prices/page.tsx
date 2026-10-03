'use client'

import { useState, useEffect } from 'react'

export default function DevicePricesPage() {
  const [prices, setPrices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [newCount, setNewCount] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || (role !== 'admin' && role !== 'owner')) {
      window.location.href = '/login'
      return
    }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/device-prices')
      const data = await res.json()
      if (data.status === 'success') setPrices(data.prices || [])
    } catch (e) {}
    setLoading(false)
  }

  function startEdit(count: number, price: number) {
    setEditing(count)
    setEditValue(String(price))
    setMessage('')
  }

  async function saveEdit(count: number) {
    if (!editValue || parseFloat(editValue) < 0) {
      setMessage('❌ سعر غير صالح')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/device-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_count: count,
          price: parseFloat(editValue),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✅ تم التحديث')
        setEditing(null)
        load()
      } else {
        setMessage('❌ ' + (data.message || 'فشل'))
      }
    } catch (e: any) {
      setMessage('❌ ' + e.message)
    }
    setSaving(false)
  }

  async function handleAdd() {
    if (!newCount || !newPrice) return
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/device-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_count: parseInt(newCount),
          price: parseFloat(newPrice),
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✅ تمت الإضافة')
        setNewCount('')
        setNewPrice('')
        setShowAdd(false)
        load()
      } else {
        setMessage('❌ ' + (data.message || 'فشل'))
      }
    } catch (e: any) {
      setMessage('❌ ' + e.message)
    }
    setSaving(false)
  }

  async function handleDelete(count: number) {
    if (!confirm(`حذف سعر ${count} جهاز؟`)) return

    try {
      await fetch(`/api/admin/device-prices?device_count=${count}`, {
        method: 'DELETE',
      })
      load()
    } catch (e) {}
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>💻</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#d4af37', marginBottom: '8px' }}>
            أسعار الأجهزة
          </h1>
          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '6px' }}>
            DEVICE PRICING
          </p>
        </div>

        <div style={{
          background: 'rgba(212,175,55,0.1)',
          border: '1px solid rgba(212,175,55,0.4)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '20px',
          color: '#b8941f',
          fontSize: '13px',
          textAlign: 'center',
          lineHeight: 1.8
        }}>
          💡 ضع سعراً لكل عدد أجهزة. عند إنشاء مفتاح، السعر = <strong>سعر النوع × سعر الأجهزة</strong>
          <br />
          <span style={{ fontSize: '11px', color: '#888' }}>
            (مثال: شهر = $5 + 3 أجهزة = $12 → الإجمالي = $17 للكود)
          </span>
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

        {/* Add Button */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              padding: '12px 25px',
              background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >{showAdd ? '✕ إلغاء' : '➕ إضافة عدد أجهزة جديد'}</button>
        </div>

        {/* Add Form */}
        {showAdd && (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(76,175,80,0.4)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="number"
                placeholder="عدد الأجهزة"
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                min={1}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="number"
                placeholder="السعر ($)"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                min={0}
                step={0.5}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={handleAdd}
                disabled={saving}
                style={{
                  padding: '12px 25px',
                  background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >{saving ? '...' : 'إضافة'}</button>
            </div>
          </div>
        )}

        {/* Prices Table */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '20px'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : prices.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              لا توجد أسعار. أضف واحداً.
            </div>
          ) : (
            prices.map((p) => (
              <div key={p.device_count} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px',
                borderBottom: '1px solid rgba(212,175,55,0.15)',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <div style={{ color: '#e8e8e8', fontSize: '14px', flex: 1, minWidth: '100px' }}>
                  💻 {p.device_count} جهاز
                </div>

                {editing === p.device_count ? (
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
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      onClick={() => saveEdit(p.device_count)}
                      disabled={saving}
                      style={{
                        padding: '8px 14px',
                        background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: saving ? 'wait' : 'pointer',
                        fontSize: '12px'
                      }}
                    >حفظ</button>
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                      onClick={() => startEdit(p.device_count, p.price)}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.6)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >✏️</button>
                    <button
                      onClick={() => handleDelete(p.device_count)}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        color: '#e57373',
                        border: '1px solid rgba(229,115,115,0.5)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >🗑️</button>
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
