'use client'

import { useState, useEffect } from 'react'

const PRESETS: Record<string, number> = {
  day1: 1, day3: 3, week1: 7, month1: 30, month2: 60,
  month3: 90, month6: 180, year1: 365, forever: 36500,
}

export default function CreateKeyPage() {
  const [type, setType] = useState('month1')
  const [count, setCount] = useState(1)
  const [devices, setDevices] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState<string[]>([])
  const [error, setError] = useState('')
  const [cost, setCost] = useState(0)

  const [typePrices, setTypePrices] = useState<any[]>([])
  const [devicePrices, setDevicePrices] = useState<any[]>([])
  const [balance, setBalance] = useState(0)
  const [userRole, setUserRole] = useState('admin')

  useEffect(() => {
    if (localStorage.getItem('panel_auth') !== 'true') {
      window.location.href = '/login'
      return
    }
    setUserRole(localStorage.getItem('panel_role') || 'admin')
    setBalance(parseFloat(localStorage.getItem('panel_balance') || '0'))
    loadPrices()
  }, [])

  async function loadPrices() {
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/admin/prices'),
        fetch('/api/admin/device-prices'),
      ])
      const data1 = await res1.json()
      const data2 = await res2.json()
      if (data1.status === 'success') setTypePrices(data1.prices || [])
      if (data2.status === 'success') setDevicePrices(data2.prices || [])
    } catch (e) {}
  }

  const getTypePrice = () => {
    const found = typePrices.find(p => p.duration_type === type)
    return found ? parseFloat(found.price) : 1
  }

  const getDevicePrice = () => {
    const exact = devicePrices.find(p => p.device_count === devices)
    if (exact) return parseFloat(exact.price)

    // أقرب أقل
    const lower = devicePrices
      .filter(p => p.device_count <= devices)
      .sort((a, b) => b.device_count - a.device_count)[0]
    if (lower) return parseFloat(lower.price)

    // الأدنى
    const lowest = devicePrices.sort((a, b) => a.device_count - b.device_count)[0]
    return lowest ? parseFloat(lowest.price) : 1
  }

  const pricePerKey = getTypePrice() + getDevicePrice()
  const totalCost = pricePerKey * count
  const notEnough = userRole === 'distributor' && balance < totalCost

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setKeys([])
    setCost(0)

    try {
      const username = localStorage.getItem('panel_user') || ''

      const res = await fetch('/api/license/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, count, devices, username }),
      })

      const data = await res.json()

      if (data.banned) {
        localStorage.clear()
        window.location.href = '/dashboard/banned'
        return
      }

      if (data.success) {
        setKeys(data.keys || [])
        setCost(data.cost || 0)

        if (data.cost > 0) {
          const newBalance = Math.max(0, balance - data.cost)
          localStorage.setItem('panel_balance', String(newBalance))
          setBalance(newBalance)
        }
      } else {
        setError(data.message || 'فشل إنشاء المفاتيح')
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(keys.join('\n'))
    alert('تم نسخ كل المفاتيح ✅')
  }

  const inputStyle: any = {
    width: '100%',
    padding: '14px',
    background: '#0a0a0a',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '10px',
    color: '#e8e8e8',
    fontSize: '15px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    outline: 'none'
  }

  const labelStyle: any = {
    display: 'block',
    color: '#d4af37',
    fontSize: '12px',
    marginBottom: '8px',
    letterSpacing: '2px'
  }

  const isAdmin = userRole === 'admin' || userRole === 'owner'

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        <a href="/dashboard" style={{
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
          padding: '40px 30px',
          boxShadow: '0 15px 50px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.15)'
        }}>

          <div style={{ textAlign: 'center', fontSize: '50px', marginBottom: '10px' }}>🔑</div>

          <h1 style={{
            fontWeight: 900,
            textAlign: 'center',
            fontSize: '24px',
            letterSpacing: '4px',
            background: 'linear-gradient(180deg, #f4d03f, #d4af37, #b8941f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '25px'
          }}>إنشاء مفاتيح</h1>

          <div style={{
            width: '120px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            margin: '0 auto 30px'
          }} />

          {userRole === 'distributor' && (
            <div style={{
              background: 'rgba(76,175,80,0.1)',
              border: '1px solid rgba(76,175,80,0.4)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              textAlign: 'center',
              color: '#66bb6a',
              fontSize: '14px',
              fontWeight: 700
            }}>
              💰 رصيدك: ${balance.toFixed(2)}
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(229,115,115,0.15)',
              border: '1px solid rgba(229,115,115,0.5)',
              color: '#ef5350',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '13px'
            }}>✦ {error} ✦</div>
          )}

          <form onSubmit={handleCreate}>
            <label style={labelStyle}>نوع المدة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={inputStyle}
            >
              <option value="day1">📅 يوم واحد — ${typePrices.find(p => p.duration_type === 'day1')?.price || 0}</option>
              <option value="day3">📅 3 أيام — ${typePrices.find(p => p.duration_type === 'day3')?.price || 0}</option>
              <option value="week1">📆 أسبوع — ${typePrices.find(p => p.duration_type === 'week1')?.price || 0}</option>
              <option value="month1">🗓️ شهر — ${typePrices.find(p => p.duration_type === 'month1')?.price || 0}</option>
              <option value="month2">🗓️ شهران — ${typePrices.find(p => p.duration_type === 'month2')?.price || 0}</option>
              <option value="month3">🗓️ 3 أشهر — ${typePrices.find(p => p.duration_type === 'month3')?.price || 0}</option>
              <option value="month6">🗓️ 6 أشهر — ${typePrices.find(p => p.duration_type === 'month6')?.price || 0}</option>
              <option value="year1">🗓️ سنة — ${typePrices.find(p => p.duration_type === 'year1')?.price || 0}</option>
              <option value="forever">♾️ دائم — ${typePrices.find(p => p.duration_type === 'forever')?.price || 0}</option>
            </select>

            <label style={labelStyle}>عدد المفاتيح (1-50)</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              style={inputStyle}
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} مفتاح</option>
              ))}
            </select>

            <label style={labelStyle}>عدد الأجهزة المسموحة</label>
            <input
              type="number"
              value={devices}
              onChange={(e) => setDevices(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              style={inputStyle}
            />

            {/* Pricing Preview */}
            <div style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.4)',
              borderRadius: '12px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '13px',
                color: '#ccc'
              }}>
                <span>سعر النوع:</span>
                <span style={{ color: '#f4d03f', fontFamily: 'monospace' }}>
                  ${getTypePrice().toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '13px',
                color: '#ccc'
              }}>
                <span>سعر الأجهزة ({devices}):</span>
                <span style={{ color: '#f4d03f', fontFamily: 'monospace' }}>
                  ${getDevicePrice().toFixed(2)}
                </span>
              </div>
              <div style={{
                borderTop: '1px solid rgba(212,175,55,0.3)',
                paddingTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '14px',
                fontWeight: 700,
                color: '#d4af37'
              }}>
                <span>لللكود الواحد:</span>
                <span style={{ fontFamily: 'monospace' }}>
                  ${pricePerKey.toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '16px',
                fontWeight: 900,
                color: '#66bb6a'
              }}>
                <span>الإجمالي:</span>
                <span style={{ fontFamily: 'monospace' }}>
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            {notEnough && (
              <div style={{
                background: 'rgba(229,115,115,0.15)',
                border: '1px solid rgba(229,115,115,0.5)',
                color: '#ef5350',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                textAlign: 'center',
                fontSize: '13px'
              }}>
                ⚠️ رصيدك غير كافٍ ($ {balance.toFixed(2)}). تحتاج ${totalCost.toFixed(2)}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || notEnough}
              style={{
                width: '100%',
                padding: '16px',
                background: notEnough
                  ? 'linear-gradient(135deg, #666, #888)'
                  : 'linear-gradient(135deg, #d4af37, #f4d03f)',
                color: notEnough ? '#333' : '#0a0a0a',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '15px',
                letterSpacing: '3px',
                cursor: (loading || notEnough) ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '... جاري الإنشاء' : (notEnough ? '❌ رصيدك غير كافٍ' : '✦ توليد المفاتيح ✦')}
            </button>
          </form>

          {keys.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <div style={{
                background: 'rgba(76,175,80,0.15)',
                border: '1px solid rgba(76,175,80,0.5)',
                color: '#66bb6a',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                ✅ تم إنشاء {keys.length} مفتاح
                {cost > 0 && (
                  <div style={{ color: '#f4d03f', fontSize: '13px', marginTop: '5px' }}>
                    💰 التكلفة: ${cost.toFixed(2)}
                  </div>
                )}
              </div>

              <button
                onClick={copyAll}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  marginBottom: '15px',
                  background: 'transparent',
                  color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.6)',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >📋 نسخ كل المفاتيح</button>

              <div style={{
                background: '#000',
                border: '1px dashed #d4af37',
                borderRadius: '10px',
                padding: '15px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {keys.map((k, i) => (
                  <div key={i} style={{
                    padding: '10px',
                    borderBottom: '1px solid rgba(212,175,55,0.2)',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#f4d03f',
                    textAlign: 'center'
                  }}>
                    {i + 1}. {k}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Admin: Manage Prices */}
        {isAdmin && (
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#999', fontSize: '13px', marginBottom: '15px' }}>
              ⚙️ إدارة الأسعار (للأدمن)
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/dashboard/admin/prices" style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.6)',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700
              }}>💵 أسعار الأنواع</a>
              <a href="/dashboard/admin/device-prices" style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.6)',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700
              }}>💻 أسعار الأجهزة</a>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
