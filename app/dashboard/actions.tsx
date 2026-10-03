'use client'

import { useState } from 'react'

interface ActionsProps {
  licenseId: number
  isBanned: boolean
  onRefresh: () => void
}

const PRESETS = [
  { value: 'day1', label: '📅 يوم' },
  { value: 'week1', label: '📆 أسبوع' },
  { value: 'month1', label: '🗓️ شهر' },
  { value: 'month2', label: '🗓️ شهران' },
  { value: 'month3', label: '🗓️ 3 أشهر' },
  { value: 'month6', label: '🗓️ 6 أشهر' },
  { value: 'year1', label: '🗓️ سنة' },
  { value: 'forever', label: '♾️ دائم' },
]

export default function Actions({ licenseId, isBanned, onRefresh }: ActionsProps) {
  const [showBan, setShowBan] = useState(false)
  const [showRenew, setShowRenew] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [renewType, setRenewType] = useState('month1')
  const [loading, setLoading] = useState(false)

  async function handleBan() {
    setLoading(true)
    await fetch('/api/license/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_id: licenseId, action: 'ban', reason: banReason }),
    })
    setShowBan(false)
    setBanReason('')
    setLoading(false)
    onRefresh()
  }

  async function handleUnban() {
    if (!confirm('فك الحظر عن هذا المفتاح؟')) return
    setLoading(true)
    await fetch('/api/license/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_id: licenseId, action: 'unban' }),
    })
    setLoading(false)
    onRefresh()
  }

  async function handleRenew() {
    setLoading(true)
    await fetch('/api/license/renew', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_id: licenseId, type: renewType }),
    })
    setShowRenew(false)
    setLoading(false)
    onRefresh()
  }

  async function handleDelete() {
    setLoading(true)
    await fetch('/api/license/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_id: licenseId }),
    })
    setShowDelete(false)
    setLoading(false)
    onRefresh()
  }

  const btnStyle = {
    fontSize: '16px',
    padding: '6px 10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#d4af37',
  }

  const modalStyle = {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  }

  const boxStyle = {
    background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
    border: '2px solid #d4af37',
    borderRadius: '20px',
    padding: '30px 25px',
    maxWidth: '400px',
    width: '100%',
  }

  return (
    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-start' }}>
      {isBanned ? (
        <button onClick={handleUnban} style={{ ...btnStyle, color: '#66bb6a' }} title="فك الحظر">
          ✅
        </button>
      ) : (
        <button onClick={() => setShowBan(true)} style={{ ...btnStyle, color: '#ef5350' }} title="حظر">
          🚫
        </button>
      )}

      <button onClick={() => setShowRenew(true)} style={{ ...btnStyle, color: '#66bb6a' }} title="تجديد">
        ♻️
      </button>

      <button onClick={() => setShowDelete(true)} style={{ ...btnStyle, color: '#e57373' }} title="حذف">
        🗑️
      </button>

      {/* Ban Modal */}
      {showBan && (
        <div style={modalStyle} onClick={() => setShowBan(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef5350', textAlign: 'center', marginBottom: '20px' }}>🚫 حظر المفتاح</h3>
            <input
              type="text"
              placeholder="سبب الحظر (اختياري)"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              className="input"
              style={{ marginBottom: '20px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleBan} disabled={loading} className="btn-gold"
                style={{ flex: 1, background: '#c62828', color: '#fff' }}>
                {loading ? '...' : 'تأكيد'}
              </button>
              <button onClick={() => setShowBan(false)} className="btn-gold"
                style={{ flex: 1, background: 'transparent', color: '#d4af37', border: '1px solid #d4af37' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {showRenew && (
        <div style={modalStyle} onClick={() => setShowRenew(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#66bb6a', textAlign: 'center', marginBottom: '20px' }}>♻️ تجديد المفتاح</h3>
            <select value={renewType} onChange={e => setRenewType(e.target.value)} className="input"
              style={{ marginBottom: '20px' }}>
              {PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleRenew} disabled={loading} className="btn-gold"
                style={{ flex: 1, background: '#4CAF50', color: '#fff' }}>
                {loading ? '...' : 'تأكيد'}
              </button>
              <button onClick={() => setShowRenew(false)} className="btn-gold"
                style={{ flex: 1, background: 'transparent', color: '#d4af37', border: '1px solid #d4af37' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDelete && (
        <div style={modalStyle} onClick={() => setShowDelete(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef5350', textAlign: 'center', marginBottom: '20px' }}>🗑️ حذف المفتاح</h3>
            <p style={{ color: '#ffab91', textAlign: 'center', marginBottom: '20px' }}>
              هل أنت متأكد؟ لا يمكن التراجع!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleDelete} disabled={loading} className="btn-gold"
                style={{ flex: 1, background: '#c62828', color: '#fff' }}>
                {loading ? '...' : 'نعم، احذف'}
              </button>
              <button onClick={() => setShowDelete(false)} className="btn-gold"
                style={{ flex: 1, background: 'transparent', color: '#d4af37', border: '1px solid #d4af37' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
