'use client'

import { useState, useEffect } from 'react'
import Actions from '../actions'

export default function AdminDashboardPage() {
  const [licenses, setLicenses] = useState<any[]>([])
  const [allLicenses, setAllLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [tab, setTab] = useState<'my-keys' | 'distributor-keys' | 'banned'>('my-keys')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || (role !== 'admin' && role !== 'owner')) {
      window.location.href = '/login'
      return
    }
    setUsername(localStorage.getItem('panel_user') || 'admin')
    loadAll()
  }, [])

  useEffect(() => {
    filterLicenses(tab)
  }, [tab, allLicenses])

  async function loadAll() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/license/list')
      const data = await res.json()
      if (data.status === 'success') {
        setAllLicenses(data.licenses || [])
      } else {
        setError(data.message || 'خطأ')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  function refresh() {
    loadAll()
  }

  function filterLicenses(currentTab: 'my-keys' | 'distributor-keys' | 'banned') {
    if (currentTab === 'banned') {
      setLicenses(allLicenses.filter(l => l.is_banned))
    } else if (currentTab === 'my-keys') {
      setLicenses(allLicenses.filter(l => !l.created_by_user && !l.is_banned))
    } else {
      setLicenses(allLicenses.filter(l => l.created_by_user && !l.is_banned))
    }
  }

  function handleLogout() {
    localStorage.clear()
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
          }}>👤 {username} (Admin)</div>

          <div style={{ fontSize: '52px' }}>👑</div>

          <h1 style={{
            fontSize: '32px',
            letterSpacing: '6px',
            color: '#d4af37',
            marginTop: '10px'
          }}>ROYAL ADMIN</h1>

          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '8px', marginTop: '8px' }}>
            MASTER CONTROL PANEL
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

          <a href="/dashboard/admin/prices" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>💵 الأسعار</a>

          <a href="/dashboard/admin/device-prices" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>💻 أسعار الأجهزة</a>

          <a href="/dashboard/admin/distributors" style={{
            display: 'inline-block',
            padding: '14px 26px',
            background: 'transparent',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.6)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>🎯 الموزعين</a>

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
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setTab('my-keys')}
            style={{
              padding: '12px 22px',
              background: tab === 'my-keys' ? 'linear-gradient(135deg, #d4af37, #f4d03f)' : 'transparent',
              color: tab === 'my-keys' ? '#0a0a0a' : '#d4af37',
              border: tab === 'my-keys' ? 'none' : '1px solid rgba(212,175,55,0.5)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >🔑 مفاتيحي ({allLicenses.filter(l => !l.created_by_user && !l.is_banned).length})</button>

          <button
            onClick={() => setTab('distributor-keys')}
            style={{
              padding: '12px 22px',
              background: tab === 'distributor-keys' ? 'linear-gradient(135deg, #2196F3, #64B5F6)' : 'transparent',
              color: tab === 'distributor-keys' ? '#fff' : '#64B5F6',
              border: tab === 'distributor-keys' ? 'none' : '1px solid rgba(100,181,246,0.5)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >🎯 مفاتيح الموزعين ({allLicenses.filter(l => l.created_by_user && !l.is_banned).length})</button>

          <button
            onClick={() => setTab('banned')}
            style={{
              padding: '12px 22px',
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
          border: tab === 'banned'
            ? '2px solid rgba(229,115,115,0.5)'
            : (tab === 'distributor-keys' ? '2px solid rgba(33,150,243,0.5)' : '2px solid rgba(212,175,55,0.4)'),
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(212,175,55,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{
              color: tab === 'banned' ? '#ef5350' : (tab === 'distributor-keys' ? '#64B5F6' : '#d4af37'),
              fontSize: '20px',
              letterSpacing: '4px'
            }}>
              {tab === 'banned' ? '🚫 BANNED LICENSES'
                : (tab === 'distributor-keys' ? '🎯 DISTRIBUTOR LICENSES' : '🔑 MY LICENSES')}
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : licenses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>
                {tab === 'banned' ? '✅' : (tab === 'distributor-keys' ? '🎯' : '🔑')}
              </div>
              <p>
                {tab === 'banned' ? 'لا توجد مفاتيح محظورة'
                  : (tab === 'distributor-keys' ? 'لا توجد مفاتيح موزعين' : 'لا توجد مفاتيح بعد')}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>KEY</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>TYPE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>EXPIRES</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>USED / LIMIT</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((l, i) => {
                    const exp = l.expires_at ? new Date(l.expires_at) : null
                    const isActive = exp && !isNaN(exp.getTime()) && exp > new Date() && l.is_active && !l.is_banned
                    const used = l.used_count || 0
                    const limit = l.max_devices || 1
                    const isFull = used >= limit
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
                        <td style={{ padding: '14px 10px', fontSize: '12px', fontFamily: 'monospace' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                            <span style={{
                              color: isFull ? '#ef5350' : '#66bb6a',
                              fontWeight: 700
                            }}>
                              {used.toLocaleString('en')} / {limit.toLocaleString('en')}
                            </span>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                              direction: 'ltr'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${Math.min(100, (used / limit) * 100)}%`,
                                background: isFull
                                  ? 'linear-gradient(90deg, #ef5350, #ff8a80)'
                                  : 'linear-gradient(90deg, #d4af37, #f4d03f)',
                                transition: 'width 0.3s'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '12px',
                          color: l.is_banned ? '#ef5350' : (isActive ? '#66bb6a' : '#ffa726')
                        }}>
                          {l.is_banned ? '🚫 محظور' : (isActive ? '✅ نشط' : '⏰ منتهي')}
                        </td>
                        <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                          <Actions
                            licenseId={l.id}
                            isBanned={!!l.is_banned}
                            isActive={!!l.is_active}
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
