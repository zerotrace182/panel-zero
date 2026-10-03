'use client'

import { useState, useEffect } from 'react'
import Actions from './actions'

export default function DashboardPage() {
  const [licenses, setLicenses] = useState<any[]>([])
  const [allLicenses, setAllLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [userRole, setUserRole] = useState('admin')
  const [userBalance, setUserBalance] = useState(0)
  const [tab, setTab] = useState<'active' | 'banned'>('active')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }
    setUsername(localStorage.getItem('panel_user') || 'admin')
    setUserRole(localStorage.getItem('panel_role') || 'admin')
    setUserBalance(parseFloat(localStorage.getItem('panel_balance') || '0'))
  }, [])

  useEffect(() => {
    loadLicenses(tab)
  }, [tab])

  async function loadLicenses(currentTab: 'active' | 'banned') {
    setLoading(true)
    setError('')
    try {
      // جلب الكل (للعدادات)
      const resAll = await fetch('/api/license/list')
      const dataAll = await resAll.json()
      if (dataAll.status === 'success') {
        setAllLicenses(dataAll.licenses || [])
      }

      // جلب المفلتر حسب التبويب
      const res = await fetch(`/api/license/list?filter=${currentTab === 'banned' ? 'banned' : 'active'}`)
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

  function refresh() {
    loadLicenses(tab)
  }

  function handleLogout() {
    localStorage.removeItem('panel_auth')
    localStorage.removeItem('panel_user')
    localStorage.removeItem('panel_role')
    localStorage.removeItem('panel_balance')
    window.location.href = '/login'
  }

  const total = allLicenses.length
  const active = allLicenses.filter(l => {
    if (!l.expires_at) return false
    const exp = new Date(l.expires_at)
    return !isNaN(exp.getTime()) && exp > new Date() && l.is_active && !l.is_banned
  }).length
  const expired = allLicenses.filter(l => {
    if (!l.expires_at) return false
    const exp = new Date(l.expires_at)
    return !isNaN(exp.getTime()) && exp <= new Date() && !l.is_banned
  }).length
  const banned = allLicenses.filter(l => l.is_banned).length

  const isAdmin = userRole === 'admin' || userRole === 'owner'

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

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
          }}>
            👤 {username} <span style={{ color: '#999', fontSize: '10px' }}>({userRole})</span>
          </div>

          {userBalance > 0 && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '25px',
              background: 'rgba(76,175,80,0.15)',
              border: '1px solid rgba(76,175,80,0.5)',
              color: '#66bb6a',
              fontSize: '13px',
              padding: '8px 16px',
              borderRadius: '30px',
              fontWeight: 700
            }}>💰 ${userBalance}</div>
          )}

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

        {/* Error */}
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

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '18px',
          marginBottom: '30px'
        }}>
          {[
            { icon: '📋', value: total, label: 'TOTAL', color: '#d4af37' },
            { icon: '✅', value: active, label: 'ACTIVE', color: '#66bb6a' },
            { icon: '⏰', value: expired, label: 'EXPIRED', color: '#ffa726' },
            { icon: '🚫', value: banned, label: 'BANNED', color: '#ef5350' }
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
            background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
            color: '#0a0a0a',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>✦ إنشاء مفتاح ✦</a>

          {isAdmin && (
            <>
              <a href="/dashboard/invites" style={{
                display: 'inline-block',
                padding: '14px 26px',
                background: 'transparent',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.6)',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px'
              }}>🎫 الرموز</a>

              <a href="/dashboard/users" style={{
                display: 'inline-block',
                padding: '14px 26px',
                background: 'transparent',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.6)',
                textDecoration: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px'
              }}>👥 المستخدمين</a>
            </>
          )}

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

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '15px',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(212,175,55,0.2)',
          paddingBottom: '15px'
        }}>
          <button
            onClick={() => setTab('active')}
            style={{
              padding: '10px 22px',
              background: tab === 'active' ? 'linear-gradient(135deg, #d4af37, #f4d03f)' : 'transparent',
              color: tab === 'active' ? '#0a0a0a' : '#d4af37',
              border: tab === 'active' ? 'none' : '1px solid rgba(212,175,55,0.5)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >📋 النشطة ({total - banned})</button>

          <button
            onClick={() => setTab('banned')}
            style={{
              padding: '10px 22px',
              background: tab === 'banned' ? 'linear-gradient(135deg, #c62828, #e57373)' : 'transparent',
              color: tab === 'banned' ? '#fff' : '#e57373',
              border: tab === 'banned' ? 'none' : '1px solid rgba(229,115,115,0.5)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >🚫 المحظورة ({banned})</button>
        </div>

        {/* Table */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: tab === 'banned' ? '2px solid rgba(229,115,115,0.5)' : '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(212,175,55,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{
              color: tab === 'banned' ? '#ef5350' : '#d4af37',
              fontSize: '20px',
              letterSpacing: '4px'
            }}>
              {tab === 'banned' ? '🚫 BANNED LICENSES' : 'ROYAL LICENSES'}
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : licenses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>
                {tab === 'banned' ? '✅' : '📜'}
              </div>
              <p style={{ marginBottom: '15px' }}>
                {tab === 'banned' ? 'لا توجد مفاتيح محظورة' : 'لا توجد مفاتيح بعد'}
              </p>
              {tab === 'active' && (
                <a href="/dashboard/create" style={{ color: '#d4af37' }}>
                  ➕ أنشئ أول مفتاح
                </a>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>KEY</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>TYPE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>EXPIRES</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>DEVICES</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>ACTIONS</th>
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
                        <td style={{ padding: '14px 10px', fontSize: '12px', color: '#d4af37', fontFamily: 'monospace' }}>
                          {l.device_count || 0} / {l.max_devices || 1}
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          color: l.is_banned ? '#ef5350' : (isActive ? '#66bb6a' : '#ffa726')
                        }}>
                          {l.is_banned ? '🚫 محظور' : (isActive ? '✅ نشط' : '⏰ منتهي')}
                        </td>
                        <td style={{ padding: '10px 6px' }}>
                          <Actions
                            licenseId={l.id}
                            isBanned={!!l.is_banned}
                            onRefresh={refresh}
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
