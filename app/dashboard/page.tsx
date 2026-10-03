'use client'

import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [licenses, setLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }
    setUsername(localStorage.getItem('panel_user') || 'admin')
    loadLicenses()
  }, [])

  async function loadLicenses() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/license/list')
      const data = await res.json()
      if (data.status === 'success') {
        setLicenses(data.licenses || [])
      } else {
        setError(data.message || 'خطأ في التحميل')
        setLicenses([])
      }
    } catch (e: any) {
      setError(e.message || 'خطأ في الاتصال')
      setLicenses([])
    }
    setLoading(false)
  }

  function handleLogout() {
    localStorage.removeItem('panel_auth')
    localStorage.removeItem('panel_user')
    window.location.href = '/login'
  }

  const total = licenses.length
  const active = licenses.filter(l => {
    if (!l.expires_at) return false
    const exp = new Date(l.expires_at)
    return !isNaN(exp.getTime()) && exp > new Date() && l.is_active && !l.is_banned
  }).length
  const expired = licenses.filter(l => {
    if (!l.expires_at) return false
    const exp = new Date(l.expires_at)
    return !isNaN(exp.getTime()) && exp <= new Date()
  }).length
  const banned = licenses.filter(l => l.is_banned).length

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #d4af37',
          borderRadius: '20px',
          padding: '35px 25px 30px',
          marginBottom: '30px',
          position: 'relative',
          textAlign: 'center'
        }}>
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '25px',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.5)',
            color: '#f4d03f',
            fontSize: '12px',
            padding: '8px 16px',
            borderRadius: '30px'
          }}>👤 {username}</div>

          <div style={{ fontSize: '52px' }}>👑</div>

          <h1 style={{
            fontSize: '32px',
            letterSpacing: '6px',
            color: '#d4af37',
            marginTop: '10px'
          }}>ROYAL CONTROL</h1>

          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '8px', marginTop: '8px' }}>
            PREMIUM LICENSE MANAGEMENT
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(229,115,115,0.15)',
            border: '1px solid rgba(229,115,115,0.5)',
            color: '#ef5350',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>⚠️ {error}</div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '18px',
          marginBottom: '30px'
        }}>
          {[
            { icon: '📋', value: total, label: 'TOTAL' },
            { icon: '✅', value: active, label: 'ACTIVE' },
            { icon: '⏰', value: expired, label: 'EXPIRED' },
            { icon: '🚫', value: banned, label: 'BANNED' }
          ].map((s, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '16px',
              padding: '25px 15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: '#d4af37', marginBottom: '5px' }}>{s.value}</div>
              <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

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
            background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
            color: '#0a0a0a',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>✦ إنشاء مفتاح ✦</a>

          <a href="/dashboard/charts" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>📊 الإحصائيات</a>

          <a href="/dashboard/activity" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>📜 السجل</a>

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

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(212,175,55,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#d4af37', fontSize: '20px', letterSpacing: '4px' }}>
              ROYAL LICENSES
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : licenses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>📜</div>
              <p style={{ marginBottom: '15px' }}>لا توجد مفاتيح بعد</p>
              <a href="/dashboard/create" style={{ color: '#d4af37' }}>
                ➕ أنشئ أول مفتاح
              </a>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>KEY</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>TYPE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>EXPIRES</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l, i) => {
                    const exp = l.expires_at ? new Date(l.expires_at) : null
                    const isActive = exp && !isNaN(exp.getTime()) && exp > new Date() && l.is_active && !l.is_banned
                    return (
                      <tr key={l.id || i} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                        <td style={{ padding: '14px 10px', fontSize: '11px', fontFamily: 'monospace', color: '#f4d03f' }}>
                          {String(l.license_key || '—').substring(0, 20)}...
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '12px', color: '#ccc' }}>
                          {l.duration_type || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '11px', color: '#999' }}>
                          {exp && !isNaN(exp.getTime()) ? exp.toLocaleDateString('ar') : '—'}
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          color: l.is_banned ? '#ef5350' : (isActive ? '#66bb6a' : '#ffa726')
                        }}>
                          {l.is_banned ? '🚫 محظور' : (isActive ? '✅ نشط' : '⏰ منتهي')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
