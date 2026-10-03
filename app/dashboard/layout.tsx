'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('panel_auth') !== 'true') {
      router.push('/login')
    }
  }, [router])

  return <>{children}</>
}
