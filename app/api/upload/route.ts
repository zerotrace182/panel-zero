import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لا يوجد ملف' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'يجب أن يكون الملف صورة' },
        { status: 400 }
      )
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'حجم الصورة أكبر من 5MB' },
        { status: 400 }
      )
    }

    // توليد اسم عشوائي بدون crypto
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}_${random}.${ext}`

    // قراءة الملف
    const arrayBuffer = await file.arrayBuffer()

    // رفع إلى Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('distributors')
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // الحصول على الرابط العام
    const { data: urlData } = supabaseAdmin.storage
      .from('distributors')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
