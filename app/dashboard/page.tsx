'use client'

import { useEffect } from 'react'

export default function DashboardPage() {
  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    if (auth !== 'true') {
      window.location.href = '/login'
      return
    }

    const role = localStorage.getItem('panel_role') || 'admin'

    if (role === 'distributor') {
      window.location.href = '/dashboard/distributor'
    } else {
      window.location.href = '/dashboard/admin'
    }
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: '#050505',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#d4af37',
      fontSize: '18px',
      letterSpacing: '3px'
    }}>
      ⏳ جاري التحويل...
    </main>
  )
}
