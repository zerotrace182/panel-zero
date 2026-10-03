'use client'

import { useEffect } from 'react'

export default function NoBalancePage() {
  useEffect(() => {
    localStorage.clear()
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top, rgba(229,115,115,.12) 0%, transparent 60%)',
      color: '#e8e8e8',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
        border: '2px solid #ef5350',
        borderRadius: '24px',
        padding: '45px 35px',
        textAlign: 'center',
        boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 80px rgba(229,115,115,0.2)'
      }}>

        <div style={{
          fontSize: '70px',
          marginBottom: '20px',
          filter: 'drop-shadow(0 0 30px rgba(229,115,115,0.8))'
        }}>💔</div>

        <h1 style={{
          fontSize: '26px',
          letterSpacing: '4px',
          color: '#ef5350',
          marginBottom: '15px',
          fontWeight: 900
        }}>NO BALANCE</h1>

        <div style={{
          width: '120px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #ef5350, transparent)',
          margin: '0 auto 25px'
        }} />

        <p style={{
          color: '#e57373',
          fontSize: '17px',
          fontWeight: 700,
          lineHeight: 1.8,
          marginBottom: '15px'
        }}>
          انتهى رصيدك
        </p>

        <p style={{
          color: '#999',
          fontSize: '14px',
          lineHeight: 2,
          marginBottom: '30px'
        }}>
          لا يمكنك إنشاء أكواد جديدة حالياً.
          <br />
          للتجديد، تواصل مع المطور عبر تيليجرام:
        </p>

        <div style={{
          background: 'rgba(33,150,243,0.1)',
          border: '1px solid rgba(33,150,243,0.4)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            color: '#64B5F6',
            fontSize: '22px',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '2px'
          }}>
            @op_mf
          </div>
        </div>

        <a
          href="https://t.me/op_mf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            width: '100%',
            padding: '18px',
            background: 'linear-gradient(135deg, #0088cc, #2196F3)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '14px',
            fontWeight: 900,
            fontSize: '16px',
            letterSpacing: '1px',
            marginBottom: '15px',
            boxShadow: '0 10px 30px rgba(33,150,243,0.4)',
            boxSizing: 'border-box'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
          </svg>
          التجديد من المطور
        </a>

        <a
          href="/login"
          style={{
            display: 'block',
            padding: '12px',
            color: '#666',
            textDecoration: 'none',
            fontSize: '13px'
          }}
        >
          ← العودة لتسجيل الدخول
        </a>

      </div>
    </main>
  )
}
