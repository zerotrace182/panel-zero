import './globals.css'

export const metadata = {
  title: 'Royal Panel',
  description: 'License Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
