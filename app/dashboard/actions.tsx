'use client'

import { useState } from 'react'

interface ActionsProps {
  licenseId: number
  isBanned: boolean
  isActive: boolean
  onRefresh: () => void
}

const PRESETS = [
  { value: 'day1', label: '📅 يوم' },
  { value: 'day3', label: '📅 3 أيام' },
  { value: 'week1', label: '📆 أسبوع' },
  { value: 'month1', label: '🗓️ شهر' },
  { value: 'month2', label: '🗓️ شهران' },
  { value: 'month3', label: '🗓️ 3 أشهر' },
  { value: 'month6', label: '🗓️ 6 أشهر' },
  { value: 'year1', label: '🗓️ سنة' },
  { value: 'forever', label: '♾️ دائم' },
]

export default function Actions({ licenseId, isBanned, isActive, onRefresh }: ActionsProps) {
  const [showBan, setShowBan] = useState(false)
  const [showRenew, setShowRenew] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [renewType, setRenewType] = useState('month1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBan() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/license/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId, action: 'ban', reason: banReason }),
      })
      const data = await res.json()
      if (data.success) {
        setShowBan(false)
        setBanReason('')
        onRefresh()
      } else {
        setError(data.message || 'فشل')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleUnban() {
    if (!confirm('فك الحظر عن هذا المفتاح؟')) return
    setLoading(true)
    try {
      const res = await fetch('/api/license/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId, action: 'unban' }),
      })
      const data = await res.json()
      if (data.success) onRefresh()
    } catch (e) {}
    setLoading(false)
  }

  async function handleSuspend(action: 'suspend' | 'activate') {
    if (action === 'suspend' && !confirm('إيقاف هذا المفتاح مؤقتاً؟ (لن تُرجع الفلوس)')) return
    setLoading(true)
    try {
      const res = await fetch('/api/license/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId, action }),
      })
      const data = await res.json()
      if (data.success) onRefresh()
    } catch (e) {}
    setLoading(false)
  }

  async function handleRenew() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/license/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId, type: renewType }),
      })
      const data = await res.json()
      if (data.success) {
        setShowRenew(false)
        onRefresh()
      } else {
        setError(data.message || 'فشل')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/license/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_id: licenseId }),
      })
      const data = await res.json()
      if (data.success) {
        setShowDelete(false)
        onRefresh()
      } else {
        setError(data.message || 'فشل')
      }
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const btnStyle: any = {
    fontSize: '16px',
    padding: '5px 7px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    margin: '0 1px',
    borderRadius: '6px',
  }

  const modalStyle: any = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  }

  const boxStyle: any = {
    background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
    border: '2px solid #d4af37',
    borderRadius: '20px',
    padding: '30px 25px',
    maxWidth: '420px',
    width: '100%',
  }

  const inputStyle: any = {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: '10px',
    color: '#e8e8e8',
    fontSize: '14px',
    marginBottom: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  }

  return (
    <div style={{
      display: 'flex',
      gap: '1px',
      justifyContent: 'flex-start',
      whiteSpace: 'nowrap',
    }}>
      {/* 1. Ban/Unban */}
      {isBanned ? (
        <button
          onClick={handleUnban}
          disabled={loading}
          style={{ ...btnStyle, color: '#66bb6a' }}
          title="فك الحظر"
        >✅</button>
      ) : (
        <button
          onClick={() => setShowBan(true)}
          disabled={loading}
          style={{ ...btnStyle, color: '#ef5350' }}
          title="بنّد (حظر نهائي)"
        >🚫</button>
      )}

      {/* 2. Suspend/Activate */}
      {!isBanned && (
        isActive ? (
          <button
            onClick={() => handleSuspend('suspend')}
            disabled={loading}
            style={{ ...btnStyle, color: '#ffa726' }}
            title="إيقاف مؤقت"
          >⏸️</button>
        ) : (
          <button
            onClick={() => handleSuspend('activate')}
            disabled={loading}
            style={{ ...btnStyle, color: '#66bb6a' }}
            title="تفعيل"
          >▶️</button>
        )
      )}

      {/* 3. Renew */}
      <button
        onClick={() => setShowRenew(true)}
        disabled={loading}
        style={{ ...btnStyle, color: '#4CAF50' }}
        title="تجديد"
      >♻️</button>

      {/* 4. Delete */}
      <button
        onClick={() => setShowDelete(true)}
        disabled={loading}
        style={{ ...btnStyle, color: '#e57373' }}
        title="حذف (بدون استرجاع)"
      >🗑️</button>

      {/* Ban Modal */}
      {showBan && (
        <div style={modalStyle} onClick={() => setShowBan(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef5350', textAlign: 'center', marginBottom: '15px' }}>
              🚫 بنّد المفتاح
            </h3>

            <p style={{
              color: '#ffab91',
              fontSize: '12px',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.8
            }}>
              ⚠️ المفتاح يُحظر نهائياً.<br />
              <strong style={{ color: '#ef5350' }}>لن تُرجع الفلوس للموزع.</strong>
            </p>

            {error && (
              <div style={{
                background: 'rgba(229,115,115,0.15)',
                color: '#ef5350',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                fontSize: '13px'
              }}>⚠️ {error}</div>
            )}

            <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px' }}>
              سبب البند (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: استخدام غير مصرح"
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleBan}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #c62828, #e57373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >{loading ? '...' : 'بنّد'}</button>
              <button
                onClick={() => setShowBan(false)}
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

      {/* Renew Modal */}
      {showRenew && (
        <div style={modalStyle} onClick={() => setShowRenew(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#4CAF50', textAlign: 'center', marginBottom: '20px' }}>
              ♻️ تجديد المفتاح
            </h3>

            {error && (
              <div style={{
                background: 'rgba(229,115,115,0.15)',
                color: '#ef5350',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                fontSize: '13px'
              }}>⚠️ {error}</div>
            )}

            <label style={{ display: 'block', color: '#d4af37', fontSize: '12px', marginBottom: '8px' }}>
              نوع الإضافة
            </label>
            <select
              value={renewType}
              onChange={e => setRenewType(e.target.value)}
              style={inputStyle}
            >
              {PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            <p style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginBottom: '15px' }}>
              💡 يُضاف للمدة الحالية
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRenew}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >{loading ? '...' : 'تجديد'}</button>
              <button
                onClick={() => setShowRenew(false)}
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

      {/* Delete Modal */}
      {showDelete && (
        <div style={modalStyle} onClick={() => setShowDelete(false)}>
          <div style={boxStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ef5350', textAlign: 'center', marginBottom: '15px' }}>
              🗑️ حذف المفتاح
            </h3>

            <p style={{
              color: '#ffab91',
              textAlign: 'center',
              marginBottom: '20px',
              lineHeight: 1.8,
              fontSize: '13px'
            }}>
              ⚠️ حذف نهائي لا يمكن التراجع عنه.<br />
              <strong style={{ color: '#ef5350' }}>لن تُرجع الفلوس للموزع.</strong>
            </p>

            {error && (
              <div style={{
                background: 'rgba(229,115,115,0.15)',
                color: '#ef5350',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '15px',
                textAlign: 'center',
                fontSize: '13px'
              }}>⚠️ {error}</div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #c62828, #e57373)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >{loading ? '...' : 'نعم، احذف'}</button>
              <button
                onClick={() => setShowDelete(false)}
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
    </div>
  )
}
