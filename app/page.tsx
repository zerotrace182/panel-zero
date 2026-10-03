export default function Home() {
  return (
    <main className="royal-bg" style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div className="crown">👑</div>
      <h1 className="title">ROYAL CONTROL</h1>
      <p className="subtitle">PREMIUM LICENSE MANAGEMENT</p>
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#66bb6a', fontSize: '16px', marginBottom: '20px' }}>
          ✅ الموقع يعمل بنجاح
        </p>
        <a href="/login" className="btn-gold">
          الدخول إلى اللوحة
        </a>
      </div>
    </main>
  )
}
