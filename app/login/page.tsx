'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem('panel_auth', 'true')
        localStorage.setItem('panel_user', data.username)
        localStorage.setItem('panel_role', data.role || 'admin')
        localStorage.setItem('panel_balance', String(data.balance || 0))
        window.location.href = '/dashboard'
      } else {
        setError(data.message || 'بيانات الدخول غير صحيحة')
      }
    } catch (err) {
      setError('خطأ في الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="royal-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
        border: '2px solid #d4af37',
        borderRadius: '24px',
        padding: '50px 40px 40px',
        position: 'relative',
        boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 80px rgba(212,175,55,0.15)'
      }}>
        <div style={{
          textAlign: 'center',
          fontSize: '60px',
          marginBottom: '15px',
          filter: 'drop-shadow(0 0 30px rgba(212,175,55,1))'
        }}>👑</div>

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontWeight: 900,
          textAlign: 'center',
          fontSize: '28px',
          letterSpacing: '8px',
          background: 'linear-gradient(180deg, #f4d03f, #d4af37, #b8941f)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>ROYAL</h1>

        <p style={{
          textAlign: 'center',
          color: '#b8941f',
          fontSize: '10px',
          letterSpacing: '8px',
          marginBottom: '5px'
        }}>CONTROL PANEL</p>

        <p style={{
          textAlign: 'center',
          color: '#f4d03f',
          fontSize: '13px',
          letterSpacing: '4px',
          marginTop: '12px',
          marginBottom: '25px'
        }}>◆ ZERO TRACE ◆</p>

        <div style={{
          width: '180px',
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

        <form onSubmit={handleLogin}>
          <label style={{
            display: 'block',
            color: '#d4af37',
            fontSize: '11px',
            marginBottom: '8px',
            letterSpacing: '3px'
          }}>USERNAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            required
            className="input"
            style={{ marginBottom: '20px' }}
          />

          <label style={{
            display: 'block',
            color: '#d4af37',
            fontSize: '11px',
            marginBottom: '8px',
            letterSpacing: '3px'
          }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور"
            required
            className="input"
            style={{ marginBottom: '25px' }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '15px',
              letterSpacing: '3px',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? '... جاري الدخول' : '✦ تسجيل الدخول ✦'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(212,175,55,0.2)'
        }}>
          <p style={{ color: '#888', fontSize: '12px', marginBottom: '12px' }}>
            ليس لديك حساب؟
          </p>
          <a
            href="/register"
            style={{
              display: 'inline-block',
              padding: '12px 30px',
              background: 'transparent',
              color: '#f4d03f',
              border: '1px solid rgba(212,175,55,0.6)',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: 700
            }}
          >
            ✨ إنشاء حساب جديد
          </a>
        </div>

        <p style={{
          textAlign: 'center',
          color: '#555',
          fontSize: '10px',
          marginTop: '25px',
          letterSpacing: '4px'
        }}>SECURE ACCESS · MMXXVI</p>
      </div>
    </main>
  )
}
