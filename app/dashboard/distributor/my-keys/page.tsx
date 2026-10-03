'use client'

import { useState, useEffect } from 'react'

export default function MyKeysPage() {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'banned'>('all')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || role !== 'distributor') {
      window.location.href = '/login'
      return
    }
    loadKeys()
  }, [])

  async function loadKeys() {
    setLoading(true)
    setError('')
    try {
      const username = localStorage.getItem('panel_user')
      const res = await fetch(`/api/distributor/stats?username=${username}`)
      const data = await res.json()
      if (data.status === 'success') {
        setKeys(data.keys || [])
      } else {
        setError(data.message || 'خطأ')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  function copyKey(key: string) {
    navigator.clipboard.writeText(key)
    alert('تم النسخ ✅')
  }

  const filteredKeys = keys.filter(k => {
    if (filter === 'all') return true
    const exp = k.expires_at ? new Date(k.expires_at) : null
    const isActive = exp && !isNaN(exp.getTime()) && exp > new Date() && k.is_active && !k.is_banned
    if (filter === 'active') return isActive
    if (filter === 'expired') return exp && !isNaN(exp.getTime()) && exp <= new Date() && !k.is_banned
    if (filter === 'banned') return k.is_banned
    return true
  })

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(33,150,243,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(33,150,243,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔑</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#2196F3', marginBottom: '8px' }}>
            MY KEYS
          </h1>
          <p style={{ color: '#64B5F6', fontSize: '11px', letterSpacing: '6px' }}>
            مفاتيحي
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

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'all', label: `📋 الكل (${keys.length})` },
            { key: 'active', label: '✅ نشطة' },
            { key: 'expired', label: '⏰ منتهية' },
            { key: 'banned', label: '🚫 محظورة' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              style={{
                padding: '10px 20px',
                background: filter === f.key ? 'linear-gradient(135deg, #2196F3, #64B5F6)' : 'transparent',
                color: filter === f.key ? '#fff' : '#64B5F6',
                border: filter === f.key ? 'none' : '1px solid rgba(33,150,243,0.5)',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >{f.label}</button>
          ))}
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(33,150,243,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : filteredKeys.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>🔑</div>
              <p>لا توجد مفاتيح</p>
              <a href="/dashboard/create" style={{ color: '#2196F3' }}>
                ➕ أنشئ مفتاح
              </a>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>KEY</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>TYPE</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>EXPIRES</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>DEVICES</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>COPY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((k, i) => {
                    const exp = k.expires_at ? new Date(k.expires_at) : null
                    const isActive = exp && !isNaN(exp.getTime()) && exp > new Date() && k.is_active && !k.is_banned
                    return (
                      <tr key={k.id || i} style={{ borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                        <td style={{ padding: '14px 10px', fontSize: '11px', fontFamily: 'monospace', color: '#64B5F6' }}>
                          {String(k.license_key || '—').substring(0, 22)}...
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '12px', color: '#ccc' }}>
                          {k.duration_type || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '11px', color: '#999' }}>
                          {exp && !isNaN(exp.getTime()) ? exp.toLocaleDateString('ar') : '—'}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '12px', color: '#64B5F6', fontFamily: 'monospace' }}>
                          {k.device_count || 0} / {k.max_devices || 1}
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          color: k.is_banned ? '#ef5350' : (isActive ? '#66bb6a' : '#ffa726')
                        }}>
                          {k.is_banned ? '🚫 محظور' : (isActive ? '✅ نشط' : '⏰ منتهي')}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <button
                            onClick={() => copyKey(k.license_key)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#64B5F6',
                              cursor: 'pointer',
                              fontSize: '16px'
                            }}
                            title="نسخ"
                          >📋</button>
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
