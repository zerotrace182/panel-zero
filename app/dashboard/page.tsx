'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Actions from './actions'

export default function DashboardPage() {
  const router = useRouter()
  const [licenses, setLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      router.push('/login')
      return
    }
    setUsername(localStorage.getItem('panel_user') || 'admin')
    loadLicenses()
  }, [])

  async function loadLicenses() {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        setError(error.message)
        setLicenses([])
      } else {
        setLicenses(data || [])
      }
    } catch (e: any) {
      setError(e.message)
      setLicenses([])
    }
    setLoading(false)
  }

  async function handleLogout() {
    localStorage.removeItem('panel_auth')
    localStorage.removeItem('panel_user')
    router.push('/login')
  }

  const safeDate = (d: any) => {
    if (!d) return null
    const date = new Date(d)
    if (isNaN(date.getTime())) return null
    return date
  }

  const total = licenses.length
  const active = licenses.filter(l => {
    const exp = safeDate(l?.expires_at)
    return exp && exp > new Date() && l?.is_active && !l?.is_banned
  }).length
  const expired = licenses.filter(l => {
    const exp = safeDate(l?.expires_at)
    return exp && exp <= new Date()
  }).length
  const banned = licenses.filter(l => l?.is_banned).length

  return (
    <main className="royal-bg" style={{ minHeight: '100vh', padding: '25px 15px' }}>
      <div className="container">

        {/* Header */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #d4af37',
          borderRadius: '20px',
          padding: '35px 25px 30px',
          marginBottom: '30px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 15px 50px rgba(0,0,0,0.8), 0 0 60px rgba(212,175,55,0.15)'
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

          <div style={{ fontSize: '52px', filter: 'drop-shadow(0 0 25px rgba(212,175,55,0.9))' }}>👑</div>

          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 900,
            fontSize: '32px',
            letterSpacing: '6px',
            background: 'linear-gradient(180deg, #f4d03f, #d4af37, #b8941f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginTop: '10px'
          }}>ROYAL CONTROL</h1>

          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '8px', marginTop: '8px' }}>
            PREMIUM LICENSE MANAGEMENT
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(229,115,115,0.15)',
            border: '1px solid rgba(229,115,115,0.5)',
            color: '#ef5350',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '13px'
          }}>⚠️ {error}</div>
        )}

        {/* Stats */}
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

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <a href="/dashboard/create" className="btn-gold">✦ إنشاء مفتاح ✦</a>
          <a href="/dashboard/charts" className="btn-gold" style={{
            background: 'transparent', color: '#d4af37', border: '1px solid rgba(212,175,55,0.6)'
          }}>📊 الإحصائيات</a>
          <a href="/dashboard/activity" className="btn-gold" style={{
            background: 'transparent', color: '#d4af37', border: '1px solid rgba(212,175,55,0.6)'
          }}>📜 السجل</a>
          <button onClick={handleLogout} className="btn-gold" style={{
            background: 'transparent', color: '#e57373', border: '1px solid rgba(229,115,115,0.5)'
          }}>🚪 خروج</button>
        </div>

        {/* Table */}
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
            <h2 style={{
              fontFamily: 'Georgia, serif',
              color: '#d4af37',
              fontSize: '20px',
              letterSpacing: '4px'
            }}>ROYAL LICENSES</h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
          ) : licenses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>📜</div>
              <p style={{ letterSpacing: '2px', marginBottom: '15px' }}>لا توجد مفاتيح بعد</p>
              <a href="/dashboard/create" style={{ color: '#d4af37' }}>➕ أنشئ أول مفتاح</a>
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
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l) => {
                    const exp = safeDate(l?.expires_at)
                    const isActive = exp && exp > new Date() && l?.is_active && !l?.is_banned
                    const key = l?.license_key || '—'
                    return (
                      <tr key={l?.id || Math.random()} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                        <td style={{ padding: '14px 10px', fontSize: '11px', fontFamily: 'monospace', color: '#f4d03f' }}>
                          {String(key).substring(0, 20)}...
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '12px', color: '#ccc' }}>
                          {l?.duration_type || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '11px', color: '#999' }}>
                          {exp ? exp.toLocaleDateString('ar') : '—'}
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          color: l?.is_banned ? '#ef5350' : (isActive ? '#66bb6a' : '#ffa726')
                        }}>
                          {l?.is_banned ? '🚫' : (isActive ? '✅' : '⏰')}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <Actions 
                            licenseId={l?.id} 
                            isBanned={!!l?.is_banned} 
                            onRefresh={loadLicenses} 
                          />
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
