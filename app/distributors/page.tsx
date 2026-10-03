'use client'

import { useState, useEffect } from 'react'

export default function PublicDistributorsPage() {
  const [distributors, setDistributors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await fetch('/api/admin/distributors?public=true')
      const data = await res.json()
      if (data.status === 'success') setDistributors(data.distributors || [])
    } catch (e) {}
    setLoading(false)
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(212,175,55,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(212,175,55,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <a href="/login" style={{
            color: '#d4af37',
            textDecoration: 'none',
            fontSize: '14px',
            display: 'inline-block',
            marginBottom: '20px'
          }}>← تسجيل الدخول</a>

          <div style={{ fontSize: '60px', marginBottom: '10px' }}>🎯</div>

          <h1 style={{
            fontSize: '32px',
            letterSpacing: '6px',
            color: '#d4af37',
            marginBottom: '8px',
            fontWeight: 900
          }}>DISTRIBUTORS</h1>

          <p style={{
            color: '#b8941f',
            fontSize: '11px',
            letterSpacing: '8px'
          }}>قائمة الموزعين المعتمدين</p>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            جاري التحميل...
          </div>
        ) : distributors.length === 0 ? (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '2px solid rgba(212,175,55,0.4)',
            borderRadius: '20px',
            padding: '60px',
            textAlign: 'center',
            color: '#888'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>🎯</div>
            <p>لا يوجد موزعين حالياً</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {distributors.map((d) => (
              <div key={d.id} style={{
                background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
                border: '2px solid rgba(212,175,55,0.4)',
                borderRadius: '20px',
                padding: '25px 20px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent, #d4af37, transparent)'
                }} />

                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt={d.display_name}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #d4af37',
                      marginBottom: '15px',
                      boxShadow: '0 0 25px rgba(212,175,55,0.5)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.15)',
                    border: '3px solid #d4af37',
                    margin: '0 auto 15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px'
                  }}>🎯</div>
                )}

                <h2 style={{
                  color: '#d4af37',
                  fontSize: '18px',
                  marginBottom: '10px',
                  letterSpacing: '1px',
                  fontWeight: 900
                }}>
                  {d.display_name}
                </h2>

                {d.description && (
                  <p style={{
                    color: '#aaa',
                    fontSize: '13px',
                    marginBottom: '15px',
                    lineHeight: 1.6
                  }}>
                    {d.description}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  {d.telegram_url && (
                    <a
                      href={d.telegram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #0088cc, #2196F3)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '14px',
                        letterSpacing: '1px',
                        boxShadow: '0 5px 20px rgba(33,150,243,0.3)'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/>
                      </svg>
                      تيليجرام
                    </a>
                  )}

                  {d.whatsapp_url && (
                    <a
                      href={d.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #25D366, #128C7E)',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '14px',
                        letterSpacing: '1px',
                        boxShadow: '0 5px 20px rgba(37,211,102,0.3)'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      واتساب
                    </a>
                  )}

                  {!d.telegram_url && !d.whatsapp_url && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '10px',
                      color: '#888',
                      fontSize: '12px'
                    }}>
                      لا توجد وسيلة تواصل
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          color: '#555',
          fontSize: '11px',
          letterSpacing: '4px'
        }}>
          ROYAL PANEL · MMXXVI
        </div>

      </div>
    </main>
  )
}
