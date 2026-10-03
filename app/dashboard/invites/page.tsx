'use client'

import { useState, useEffect } from 'react'

export default function InvitesPage() {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [role, setRole] = useState('distributor')
  const [balance, setBalance] = useState(10)
  const [durationDays, setDurationDays] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }
    loadInvites()
  }, [])

  async function loadInvites() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/invites')
      const data = await res.json()
      if (data.status === 'success') {
        setInvites(data.invites || [])
      } else {
        setError(data.message || 'خطأ')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setNewCode('')
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          balance,
          duration_days: durationDays,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setNewCode(data.invite.code)
        setShowForm(false)
        loadInvites()
      } else {
        setError(data.message)
      }
    } catch (e: any) {
      setError(e.message)
    }
    setSubmitting(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('حذف هذا الرمز؟')) return
    try {
      await fetch(`/api/admin/invites?id=${id}`, { method: 'DELETE' })
      loadInvites()
    } catch (e) {
      alert('فشل الحذف')
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    alert('تم النسخ ✅')
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

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
          padding: '30px 25px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎫</div>
          <h1 style={{
            fontSize: '24px',
            letterSpacing: '5px',
            color: '#d4af37',
            marginBottom: '8px'
          }}>INVITE CODES</h1>
          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '6px' }}>
            DISTRIBUTOR INVITATIONS
          </p>
        </div>

        {newCode && (
          <div style={{
            background: 'rgba(76,175,80,0.15)',
            border: '1px solid rgba(76,175,80,0.5)',
            color: '#66bb6a',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            ✅ تم إنشاء الرمز: <code style={{ color: '#f4d03f', fontSize: '16px', letterSpacing: '2px' }}>{newCode}</code>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(229,115,115,0.15)',
            border: '1px solid rgba(229,115,115,0.5)',
            color: '#ef5350',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>⚠️ {error}</div>
        )}

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '14px 30px',
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: 'pointer'
            }}
          >
            {showForm ? '✕ إلغاء' : '➕ إنشاء رمز جديد'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px', letterSpacing: '2px' }}>
                نوع الحساب
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="distributor">🎯 موزع</option>
                <option value="owner">👑 مالك</option>
                <option value="admin">⚙️ مدير</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px', letterSpacing: '2px' }}>
                الرصيد الممنوح (بالدولار)
              </label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value))}
                min={0}
                step={0.5}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px', letterSpacing: '2px' }}>
                صلاحية الرمز (بالأيام)
              </label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                min={1}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '10px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '14px',
                letterSpacing: '2px',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? '...' : '✦ إنشاء ✦'}
            </button>
          </form>
        )}

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(212,175,55,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#d4af37', fontSize: '18px', letterSpacing: '3px' }}>
              الرموز ({invites.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
          ) : invites.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>🎫</div>
              <p>لا توجد رموز بعد</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '11px' }}>CODE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '11px' }}>ROLE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '11px' }}>BALANCE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '11px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((inv) => {
                    const isExpired = inv.expires_at && new Date(inv.expires_at) <= new Date()
                    const used = !!inv.used_by
                    return (
                      <tr key={inv.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                        <td style={{ padding: '12px 10px', fontSize: '12px', fontFamily: 'monospace', color: '#f4d03f' }}>
                          {inv.code}
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '12px', color: '#ccc' }}>
                          {inv.role === 'distributor' ? '🎯 موزع' : inv.role === 'owner' ? '👑 مالك' : '⚙️ مدير'}
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '12px', color: '#66bb6a' }}>
                          ${inv.balance}
                        </td>
                        <td style={{ padding: '12px 10px', fontSize: '12px', color: used ? '#ef5350' : (isExpired ? '#ffa726' : '#66bb6a') }}>
                          {used ? '🔴 مستخدم' : (isExpired ? '⏰ منتهي' : '✅ صالح')}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <button
                            onClick={() => copyCode(inv.code)}
                            style={{ background: 'transparent', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '16px', marginLeft: '5px' }}
                            title="نسخ"
                          >📋</button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            style={{ background: 'transparent', border: 'none', color: '#e57373', cursor: 'pointer', fontSize: '16px' }}
                            title="حذف"
                          >🗑️</button>
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
