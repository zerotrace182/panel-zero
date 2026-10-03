'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateKeyPage() {
  const router = useRouter()
  const [type, setType] = useState('month1')
  const [count, setCount] = useState(1)
  const [devices, setDevices] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState<string[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (localStorage.getItem('panel_auth') !== 'true') {
      router.push('/login')
    }
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setKeys([])

    try {
      const res = await fetch('/api/license/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, count, devices }),
      })

      const data = await res.json()

      if (data.success) {
        setKeys(data.keys)
      } else {
        setError(data.message || 'فشل إنشاء المفاتيح')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(keys.join('\n'))
    alert('تم نسخ كل المفاتيح ✅')
  }

  return (
    <main className="royal-bg" style={{ minHeight: '100vh', padding: '25px 15px' }}>
      <div className="container" style={{ maxWidth: '600px' }}>

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
            fontFamily: 'Georgia, serif',
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
            <label className="label">نوع المدة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input"
              style={{ marginBottom: '20px' }}
            >
              <option value="day1">📅 يوم واحد</option>
              <option value="day3">📅 3 أيام</option>
              <option value="week1">📆 أسبوع</option>
              <option value="month1">🗓️ شهر</option>
              <option value="month2">🗓️ شهران</option>
              <option value="month3">🗓️ 3 أشهر</option>
              <option value="month6">🗓️ 6 أشهر</option>
              <option value="year1">🗓️ سنة</option>
              <option value="forever">♾️ دائم</option>
            </select>

            <label className="label">عدد المفاتيح (1-50)</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="input"
              style={{ marginBottom: '20px' }}
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => (
                <option key={n} value={n}>{n} مفتاح</option>
              ))}
            </select>

            <label className="label">عدد الأجهزة المسموحة</label>
            <input
              type="number"
              value={devices}
              onChange={(e) => setDevices(parseInt(e.target.value))}
              min={1}
              className="input"
              style={{ marginBottom: '25px' }}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-gold"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                letterSpacing: '3px',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '... جاري الإنشاء' : '✦ توليد المفاتيح ✦'}
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
              }}>✅ تم إنشاء {keys.length} مفتاح</div>

              <button
                onClick={copyAll}
                className="btn-gold"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  marginBottom: '15px',
                  background: 'transparent',
                  color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.6)'
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
      </div>
    </main>
  )
}
