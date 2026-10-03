'use client'

import { useState, useEffect } from 'react'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [balanceAmount, setBalanceAmount] = useState(0)
  const [balanceAction, setBalanceAction] = useState('add')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.status === 'success') {
        setUsers(data.users || [])
      } else {
        setError(data.message || 'خطأ')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleToggleActive(userId: number, currentActive: boolean) {
    if (!confirm(currentActive ? 'تعطيل هذا المستخدم؟' : 'تفعيل هذا المستخدم؟')) return

    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          action: currentActive ? 'deactivate' : 'activate',
        }),
      })
      loadUsers()
    } catch (e) {
      alert('فشل')
    }
  }

  function openBalanceModal(user: any) {
    setSelectedUser(user)
    setBalanceAmount(0)
    setBalanceAction('add')
    setShowBalanceModal(true)
  }

  async function handleBalanceSubmit() {
    if (!selectedUser || balanceAmount <= 0) return
    setSubmitting(true)

    try {
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          action: balanceAction === 'add' ? 'add_balance' : 'remove_balance',
          amount: balanceAmount,
        }),
      })
      setShowBalanceModal(false)
      loadUsers()
    } catch (e) {
      alert('فشل')
    }
    setSubmitting(false)
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#d4af37', marginBottom: '8px' }}>
            USERS MANAGEMENT
          </h1>
          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '6px' }}>
            DISTRIBUTORS & OWNERS
          </p>
        </div>

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
              المستخدمين ({users.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>👥</div>
              <p>لا يوجد مستخدمين</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>USER</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>ROLE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>BALANCE</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>STATUS</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 8px', textAlign: 'right', fontSize: '11px' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#f4d03f', fontFamily: 'monospace' }}>
                        {u.username}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '11px', color: '#ccc' }}>
                        {u.role === 'admin' ? '⚙️ Admin' : u.role === 'owner' ? '👑 Owner' : '🎯 Distributor'}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '12px', color: '#66bb6a', fontWeight: 700 }}>
                        ${parseFloat(u.balance || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '11px', color: u.is_active ? '#66bb6a' : '#ef5350' }}>
                        {u.is_active ? '✅ نشط' : '🚫 معطل'}
                      </td>
                      <td style={{ padding: '8px 6px', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => openBalanceModal(u)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#66bb6a',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 6px'
                          }}
                          title="تعديل الرصيد"
                        >💰</button>
                        <button
                          onClick={() => handleToggleActive(u.id, u.is_active)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: u.is_active ? '#ef5350' : '#66bb6a',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 6px'
                          }}
                          title={u.is_active ? 'تعطيل' : 'تفعيل'}
                        >{u.is_active ? '🚫' : '✅'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 1000
        }} onClick={() => setShowBalanceModal(false)}>
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '2px solid #d4af37',
            borderRadius: '20px',
            padding: '30px 25px',
            maxWidth: '400px',
            width: '100%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '10px' }}>
              💰 تعديل الرصيد
            </h3>
            <p style={{ color: '#999', textAlign: 'center', marginBottom: '20px', fontSize: '13px' }}>
              {selectedUser.username} — الحالي: ${parseFloat(selectedUser.balance || 0).toFixed(2)}
            </p>

            <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px' }}>
              العملية
            </label>
            <select
              value={balanceAction}
              onChange={(e) => setBalanceAction(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: '10px',
                color: '#e8e8e8',
                fontSize: '14px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            >
              <option value="add">➕ إضافة رصيد</option>
              <option value="remove">➖ خصم رصيد</option>
            </select>

            <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px' }}>
              المبلغ
            </label>
            <input
              type="number"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(parseFloat(e.target.value) || 0)}
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
                marginBottom: '20px',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleBalanceSubmit}
                disabled={submitting || balanceAmount <= 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1
                }}
              >{submitting ? '...' : 'تأكيد'}</button>

              <button
                onClick={() => setShowBalanceModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
