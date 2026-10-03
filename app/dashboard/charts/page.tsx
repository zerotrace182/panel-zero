'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ChartsPage() {
  const router = useRouter()
  const [licenses, setLicenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('panel_auth') !== 'true') {
      router.push('/login')
      return
    }
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('licenses')
      .select('*')
      .order('id', { ascending: false })

    if (data) setLicenses(data)
    setLoading(false)
  }

  const total = licenses.length
  const active = licenses.filter(l => new Date(l.expires_at) > new Date() && l.is_active && !l.is_banned).length
  const expired = licenses.filter(l => new Date(l.expires_at) <= new Date()).length
  const banned = licenses.filter(l => l.is_banned).length

  // Group by type
  const byType: Record<string, number> = {}
  licenses.forEach(l => {
    byType[l.duration_type] = (byType[l.duration_type] || 0) + 1
  })

  const maxCount = Math.max(...Object.values(byType), 1)

  const typeLabels: Record<string, string> = {
    day1: 'يوم', day3: '3 أيام', week1: 'أسبوع',
    month1: 'شهر', month2: 'شهران', month3: '3 أشهر',
    month6: '6 أشهر', year1: 'سنة', forever: 'دائم'
  }

  if (loading) {
    return (
      <main className="royal-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#d4af37' }}>جاري التحميل...</p>
      </main>
    )
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 900,
            fontSize: '24px',
            letterSpacing: '4px',
            background: 'linear-gradient(180deg, #f4d03f, #d4af37, #b8941f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>ROYAL STATISTICS</h1>
          <p style={{ color: '#b8941f', fontSize: '10px', letterSpacing: '6px', marginTop: '8px' }}>
            ANALYTICS & REPORTS
          </p>
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '18px',
          marginBottom: '25px'
        }}>
          {[
            { icon: '📋', value: total, label: 'إجمالي', color: '#d4af37' },
            { icon: '✅', value: active, label: 'نشطة', color: '#66bb6a' },
            { icon: '⏰', value: expired, label: 'منتهية', color: '#ffa726' },
            { icon: '🚫', value: banned, label: 'محظورة', color: '#ef5350' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
              border: '1px solid rgba(212,175,55,0.35)',
              borderRadius: '16px',
              padding: '25px 15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>{s.icon}</div>
              <div style={{ fontSize: '34px', fontWeight: 900, color: s.color, marginBottom: '5px' }}>
                {s.value}
              </div>
              <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bar Chart: by Type */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '25px',
          marginBottom: '25px'
        }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            color: '#d4af37',
            fontSize: '16px',
            letterSpacing: '3px',
            textAlign: 'center',
            marginBottom: '25px'
          }}>توزيع المفاتيح حسب النوع</h2>

          {Object.keys(byType).length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '30px' }}>لا توجد بيانات</p>
          ) : (
            Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ marginBottom: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#e8e8e8' }}>
                    {typeLabels[type] || type}
                  </span>
                  <span style={{ color: '#d4af37', fontWeight: 700 }}>{count}</span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#000',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid rgba(212,175,55,0.2)'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / maxCount) * 100}%`,
                    background: 'linear-gradient(90deg, #b8941f, #d4af37, #f4d03f)',
                    boxShadow: '0 0 15px rgba(212,175,55,0.5)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress bars */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '25px'
        }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            color: '#d4af37',
            fontSize: '16px',
            letterSpacing: '3px',
            textAlign: 'center',
            marginBottom: '25px'
          }}>نسب الحالة</h2>

          {[
            { label: 'نشطة', value: active, color: '#66bb6a' },
            { label: 'منتهية', value: expired, color: '#ffa726' },
            { label: 'محظورة', value: banned, color: '#ef5350' },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '6px',
                fontSize: '13px'
              }}>
                <span style={{ color: '#e8e8e8' }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700 }}>
                  {s.value} ({total > 0 ? Math.round((s.value / total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                height: '8px',
                background: '#000',
                borderRadius: '4px',
                overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.2)'
              }}>
                <div style={{
                  height: '100%',
                  width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
                  background: s.color,
                  boxShadow: `0 0 15px ${s.color}`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
