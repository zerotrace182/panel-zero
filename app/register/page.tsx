'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          invite_code: inviteCode,
        }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('panel_auth', 'true')
        localStorage.setItem('panel_user', data.username)
        window.location.href = '/dashboard'
      } else {
        setError(data.message || 'فشل التسجيل')
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
        border: '2px solid #d4af37',
        borderRadius: '24px',
        padding: '45px 35px 35px',
        boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 80px rgba(212,175,55,0.15)'
      }}>
        <div style={{ textAlign: 'center', fontSize: '55px', marginBottom: '10px' }}>👑</div>

        <h1 style={{
          fontSize: '24px',
          letterSpacing: '6px',
          color: '#d4af37',
          textAlign: 'center',
          marginBottom: '8px'
        }}>ROYAL</h1>

        <p style={{ color: '#b8941f', fontSize: '10px', letterSpacing: '6px', textAlign: 'center', marginBottom: '30px' }}>
          JOIN THE KINGDOM
        </p>

        <div style={{
          width: '140px',
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
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '13px'
          }}>✦ {error} ✦</div>
        )}

        <form onSubmit={handleRegister}>
          <label style={{ display: 'block', color: '#d4af37', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px' }}>
            USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '10px',
              color: '#e8e8e8',
              fontSize: '15px',
              marginBottom: '20px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <label style={{ display: 'block', color: '#d4af37', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px' }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '10px',
              color: '#e8e8e8',
              fontSize: '15px',
              marginBottom: '20px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <label style={{ display: 'block', color: '#d4af37', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px' }}>
            CONFIRM PASSWORD
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="أعد كلمة المرور"
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '10px',
              color: '#e8e8e8',
              fontSize: '15px',
              marginBottom: '20px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <label style={{ display: 'block', color: '#f4d03f', fontSize: '11px', marginBottom: '8px', letterSpacing: '2px' }}>
            ✨ INVITE CODE
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="أدخل رمز الإحالة"
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.6)',
              borderRadius: '10px',
              color: '#f4d03f',
              fontSize: '15px',
              marginBottom: '25px',
              outline: 'none',
              fontFamily: 'monospace',
              letterSpacing: '2px',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 900,
              letterSpacing: '3px',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '... جاري التسجيل' : '✦ إنشاء حساب ✦'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '12px', marginTop: '25px' }}>
          لديك حساب؟{' '}
          <a href="/login" style={{ color: '#d4af37', textDecoration: 'none' }}>تسجيل الدخول</a>
        </p>
      </div>
    </main>
  )
}
