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
        // إذا كان معطل
        if (data.banned) {
          window.location.href = '/dashboard/banned'
          return
        }
        setError(data.message || 'بيانات الدخول غير صحيحة')
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
        padding: '50px 40px 35px',
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
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '10px',
              color: '#e8e8e8',
              fontSize: '15px',
              marginBottom: '20px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
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
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '10px',
              color: '#e8e8e8',
              fontSize: '15px',
              marginBottom: '25px',
              boxSizing: 'border-box',
              outline: 'none'
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
            {loading ? '... جاري الدخول' : '✦ تسجيل الدخول ✦'}
          </button>
        </form>

        {/* Register Link */}
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

        {/* Telegram Contact */}
        <div style={{
          textAlign: 'center',
          marginTop: '25px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(212,175,55,0.15)'
        }}>
          <p style={{ color: '#777', fontSize: '11px', marginBottom: '12px', letterSpacing: '1px' }}>
            للتجديد والاستفسارات
          </p>

          <a
            href="https://t.me/op_mf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #0088cc, #2196F3)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '1px',
              boxShadow: '0 5px 20px rgba(33,150,243,0.3)',
              boxSizing: 'border-box'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
            </svg>
            @op_mf
          </a>
        </div>

        <p style={{
          textAlign: 'center',
          color: '#555',
          fontSize: '10px',
          marginTop: '20px',
          letterSpacing: '4px'
        }}>SECURE ACCESS · MMXXVI</p>
      </div>
    </main>
  )
}
