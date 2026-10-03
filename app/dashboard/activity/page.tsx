'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ActivityPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('panel_auth') !== 'true') {
      router.push('/login')
      return
    }
    loadActivities()
  }, [])

  async function loadActivities() {
    setLoading(true)
    const { data } = await supabase
      .from('activity_log')
      .select(`
        *,
        licenses (license_key)
      `)
      .order('id', { ascending: false })
      .limit(200)

    if (data) setActivities(data)
    setLoading(false)
  }

  function eventLabel(action: string) {
    const map: Record<string, { icon: string, label: string, color: string }> = {
      'CREATE': { icon: '✨', label: 'إنشاء', color: '#d4af37' },
      'VERIFY': { icon: '✅', label: 'تحقق', color: '#66bb6a' },
      'BAN':    { icon: '🚫', label: 'حظر', color: '#ef5350' },
      'UNBAN':  { icon: '🔓', label: 'فك حظر', color: '#4CAF50' },
      'RENEW':  { icon: '♻️', label: 'تجديد', color: '#4CAF50' },
      'DELETE': { icon: '🗑️', label: 'حذف', color: '#e57373' },
    }
    return map[action] || { icon: '📌', label: action, color: '#999' }
  }

  return (
    <main className="royal-bg" style={{ minHeight: '100vh', padding: '25px 15px' }}>
      <div className="container">

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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📜</div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 900,
            fontSize: '24px',
            letterSpacing: '4px',
            background: 'linear-gradient(180deg, #f4d03f, #d4af37, #b8941f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>ROYAL ACTIVITY LOG</h1>
          <p style={{
            color: '#b8941f',
            fontSize: '10px',
            letterSpacing: '6px',
            marginTop: '8px'
          }}>AUDIT TRAIL & HISTORY</p>
        </div>

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
            <h2 style={{
              fontFamily: 'Georgia, serif',
              color: '#d4af37',
              fontSize: '18px',
              letterSpacing: '3px'
            }}>History ({activities.length})</h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : activities.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>📜</div>
              <p>لا توجد أحداث بعد</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '10px' }}>#</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '10px' }}>الحدث</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '10px' }}>المفتاح</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '10px' }}>التفاصيل</th>
                    <th style={{ background: 'rgba(212,175,55,0.1)', color: '#f4d03f', padding: '12px 10px', textAlign: 'right', fontSize: '10px' }}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => {
                    const ev = eventLabel(a.action)
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#888' }}>{i + 1}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            background: `${ev.color}22`,
                            color: ev.color,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            border: `1px solid ${ev.color}55`
                          }}>
                            {ev.icon} {ev.label}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '10px', fontFamily: 'monospace', color: '#f4d03f' }}>
                          {a.licenses?.license_key ? a.licenses.license_key.substring(0, 18) + '...' : '—'}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '11px', color: '#aaa' }}>
                          {a.details || '—'}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '10px', color: '#999' }}>
                          {new Date(a.created_at).toLocaleString('ar')}
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
