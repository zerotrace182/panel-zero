'use client'

import { useState, useEffect } from 'react'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || role !== 'distributor') {
      window.location.href = '/login'
      return
    }
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      const username = localStorage.getItem('panel_user')
      const res = await fetch(`/api/distributor/transactions?username=${username}`)
      const data = await res.json()
      if (data.status === 'success') {
        setTransactions(data.transactions || [])
        setBalance(data.balance || 0)
      }
    } catch (e) {}
    setLoading(false)
  }

  const totalIn = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0)

  const totalOut = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      backgroundImage: 'radial-gradient(ellipse at top left, rgba(33,150,243,.08) 0%, transparent 45%), radial-gradient(ellipse at bottom right, rgba(33,150,243,.08) 0%, transparent 45%)',
      color: '#e8e8e8',
      padding: '25px 15px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <a href="/dashboard/distributor" style={{
          color: '#64B5F6',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'inline-block',
          marginBottom: '20px'
        }}>← العودة للوحة</a>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid #2196F3',
          borderRadius: '20px',
          padding: '30px 25px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#2196F3', marginBottom: '8px' }}>
            TRANSACTIONS
          </h1>
          <p style={{ color: '#64B5F6', fontSize: '11px', letterSpacing: '6px' }}>
            سجل معاملاتي
          </p>
        </div>

        {/* Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(76,175,80,0.4)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
              💰 الرصيد
            </div>
            <div style={{ color: '#66bb6a', fontSize: '24px', fontWeight: 900 }}>
              ${balance.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(76,175,80,0.4)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
              ⬆️ الإيداعات
            </div>
            <div style={{ color: '#66bb6a', fontSize: '24px', fontWeight: 900 }}>
              ${totalIn.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '1px solid rgba(229,115,115,0.4)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#999', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>
              ⬇️ المشتريات
            </div>
            <div style={{ color: '#e57373', fontSize: '24px', fontWeight: 900 }}>
              ${totalOut.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(33,150,243,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid rgba(33,150,243,0.25)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#64B5F6', fontSize: '18px', letterSpacing: '3px' }}>
              السجل ({transactions.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
              جاري التحميل...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px', opacity: 0.4 }}>📊</div>
              <p>لا توجد معاملات بعد</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>النوع</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>المبلغ</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>الوصف</th>
                    <th style={{ background: 'rgba(33,150,243,0.1)', color: '#64B5F6', padding: '14px 10px', textAlign: 'right', fontSize: '11px' }}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => {
                    const amount = parseFloat(t.amount)
                    return (
                      <tr key={t.id || i} style={{ borderBottom: '1px solid rgba(33,150,243,0.1)' }}>
                        <td style={{ padding: '14px 10px', fontSize: '12px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            background: t.type === 'purchase' ? 'rgba(229,115,115,0.15)'
                              : (t.type === 'credit' ? 'rgba(76,175,80,0.15)' : 'rgba(33,150,243,0.15)'),
                            color: t.type === 'purchase' ? '#ef5350'
                              : (t.type === 'credit' ? '#66bb6a' : '#64B5F6')
                          }}>
                            {t.type === 'purchase' ? '🛒 شراء'
                              : (t.type === 'credit' ? '➕ إيداع'
                              : (t.type === 'debit' ? '➖ خصم' : (t.type === 'initial' ? '🎁 ترحيبي' : t.type)))}
                          </span>
                        </td>
                        <td style={{
                          padding: '14px 10px',
                          fontSize: '14px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: amount >= 0 ? '#66bb6a' : '#ef5350'
                        }}>
                          {amount >= 0 ? '+' : ''}{amount.toFixed(2)}$
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '11px', color: '#999' }}>
                          {t.description || '—'}
                        </td>
                        <td style={{ padding: '14px 10px', fontSize: '11px', color: '#888' }}>
                          {t.created_at ? new Date(t.created_at).toLocaleString('ar') : '—'}
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
