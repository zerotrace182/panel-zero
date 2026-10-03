'use client'

import { useState, useEffect } from 'react'

export default function AdminDistributorsPage() {
  const [distributors, setDistributors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    display_name: '',
    image_url: '',
    telegram_url: '',
    whatsapp_url: '',
    description: '',
    is_visible: true,
    sort_order: 0,
  })

  useEffect(() => {
    const auth = localStorage.getItem('panel_auth')
    const role = localStorage.getItem('panel_role')
    if (auth !== 'true' || (role !== 'admin' && role !== 'owner')) {
      window.location.href = '/login'
      return
    }
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/distributors')
      const data = await res.json()
      if (data.status === 'success') setDistributors(data.distributors || [])
    } catch (e) {}
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm({
      display_name: '',
      image_url: '',
      telegram_url: '',
      whatsapp_url: '',
      description: '',
      is_visible: true,
      sort_order: 0,
    })
    setShowForm(true)
    setMessage('')
  }

  function openEdit(d: any) {
    setEditing(d)
    setForm({
      display_name: d.display_name || '',
      image_url: d.image_url || '',
      telegram_url: d.telegram_url || '',
      whatsapp_url: d.whatsapp_url || '',
      description: d.description || '',
      is_visible: d.is_visible !== false,
      sort_order: d.sort_order || 0,
    })
    setShowForm(true)
    setMessage('')
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (data.success) {
        setForm({ ...form, image_url: data.url })
        setMessage('✅ تم رفع الصورة')
      } else {
        setMessage('❌ ' + (data.message || 'فشل الرفع'))
      }
    } catch (err: any) {
      setMessage('❌ ' + err.message)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.display_name) {
      setMessage('❌ اسم الموزع مطلوب')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing?.id,
          ...form,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('✅ تم الحفظ')
        setShowForm(false)
        load()
      } else {
        setMessage('❌ ' + (data.message || 'فشل'))
      }
    } catch (err: any) {
      setMessage('❌ ' + err.message)
    }
    setSaving(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('حذف هذا الموزع؟')) return
    try {
      await fetch(`/api/admin/distributors?id=${id}`, { method: 'DELETE' })
      load()
    } catch (e) {}
  }

  const inputStyle: any = {
    width: '100%',
    padding: '12px',
    background: '#0a0a0a',
    border: '1px solid rgba(212,175,55,0.4)',
    borderRadius: '10px',
    color: '#e8e8e8',
    fontSize: '14px',
    marginBottom: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: any = {
    display: 'block',
    color: '#d4af37',
    fontSize: '12px',
    marginBottom: '6px',
    letterSpacing: '1px',
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

        <a href="/dashboard/admin" style={{
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
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎯</div>
          <h1 style={{ fontSize: '24px', letterSpacing: '5px', color: '#d4af37', marginBottom: '8px' }}>
            إدارة الموزعين
          </h1>
          <p style={{ color: '#b8941f', fontSize: '11px', letterSpacing: '6px' }}>
            DISTRIBUTORS MANAGEMENT
          </p>
        </div>

        {message && (
          <div style={{
            background: message.includes('✅') ? 'rgba(76,175,80,0.15)' : 'rgba(229,115,115,0.15)',
            border: message.includes('✅') ? '1px solid rgba(76,175,80,0.5)' : '1px solid rgba(229,115,115,0.5)',
            color: message.includes('✅') ? '#66bb6a' : '#ef5350',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '13px'
          }}>{message}</div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={openAdd}
            style={{
              padding: '14px 30px',
              background: 'linear-gradient(135deg, #d4af37, #f4d03f)',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 900,
              fontSize: '14px',
              letterSpacing: '2px',
              cursor: 'pointer'
            }}
          >➕ إضافة موزع</button>
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
            border: '2px solid rgba(212,175,55,0.4)',
            borderRadius: '16px',
            padding: '25px',
            marginBottom: '25px'
          }}>
            <h3 style={{ color: '#d4af37', marginBottom: '20px', textAlign: 'center' }}>
              {editing ? '✏️ تعديل الموزع' : '➕ موزع جديد'}
            </h3>

            <label style={labelStyle}>اسم الموزع (يظهر للعملاء) *</label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="مثال: المتجر الذهبي"
              style={inputStyle}
            />

            <label style={labelStyle}>صورة الموزع</label>
            {form.image_url && (
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                <img
                  src={form.image_url}
                  alt="Preview"
                  style={{
                    maxWidth: '150px',
                    maxHeight: '150px',
                    borderRadius: '12px',
                    border: '2px solid #d4af37'
                  }}
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '10px',
                background: '#0a0a0a',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: '10px',
                color: '#e8e8e8',
                fontSize: '13px',
                marginBottom: '15px',
                boxSizing: 'border-box'
              }}
            />
            {uploading && (
              <p style={{ color: '#f4d03f', fontSize: '12px', marginBottom: '15px' }}>
                ⏳ جاري الرفع...
              </p>
            )}

            <label style={labelStyle}>رابط تيليجرام</label>
            <input
              type="text"
              value={form.telegram_url}
              onChange={(e) => setForm({ ...form, telegram_url: e.target.value })}
              placeholder="https://t.me/username"
              style={inputStyle}
            />

            <label style={labelStyle}>رابط واتساب</label>
            <input
              type="text"
              value={form.whatsapp_url}
              onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })}
              placeholder="https://wa.me/1234567890"
              style={inputStyle}
            />

            <label style={labelStyle}>الوصف (اختياري)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="مثال: موزع معتمد — خدمة 24/7"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
            />

            <label style={labelStyle}>ترتيب العرض (الأصغر أولاً)</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              style={inputStyle}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                id="visible"
                style={{ width: 'auto', transform: 'scale(1.3)' }}
              />
              <label htmlFor="visible" style={{ color: '#d4af37', fontSize: '13px', cursor: 'pointer' }}>
                ✅ مرئي للعملاء
              </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #4CAF50, #66bb6a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: saving ? 'wait' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >{saving ? '...' : '💾 حفظ'}</button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'transparent',
                  color: '#d4af37',
                  border: '1px solid #d4af37',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >إلغاء</button>
            </div>
          </div>
        )}

        {/* List */}
        <div style={{
          background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
          border: '2px solid rgba(212,175,55,0.4)',
          borderRadius: '20px',
          padding: '20px'
        }}>
          <h3 style={{ color: '#d4af37', textAlign: 'center', marginBottom: '20px' }}>
            القائمة ({distributors.length})
          </h3>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
          ) : distributors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              <div style={{ fontSize: '50px', marginBottom: '10px', opacity: 0.4 }}>🎯</div>
              <p>لا يوجد موزعين بعد</p>
            </div>
          ) : (
            distributors.map((d) => (
              <div key={d.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px',
                borderBottom: '1px solid rgba(212,175,55,0.15)',
                flexWrap: 'wrap'
              }}>
                {d.image_url ? (
                  <img
                    src={d.image_url}
                    alt={d.display_name}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #d4af37'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.15)',
                    border: '2px solid rgba(212,175,55,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>🎯</div>
                )}

                <div style={{ flex: 1, minWidth: '150px' }}>
                  <div style={{ color: '#d4af37', fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    {d.display_name}
                  </div>
                  <div style={{ color: '#888', fontSize: '11px' }}>
                    {d.is_visible ? '✅ مرئي' : '❌ مخفي'}
                    {d.sort_order !== 0 && ` — ترتيب: ${d.sort_order}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => openEdit(d)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      color: '#d4af37',
                      border: '1px solid rgba(212,175,55,0.6)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >✏️</button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      color: '#e57373',
                      border: '1px solid rgba(229,115,115,0.5)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}
