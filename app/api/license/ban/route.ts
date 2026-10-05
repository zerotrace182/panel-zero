import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { license_id, action, reason } = body

    // 1. التحقق من البيانات
    if (!license_id || !action) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة: license_id و action مطلوبان' },
        { status: 400 }
      )
    }

    // 2. تنفيذ الحظر
    if (action === 'ban') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({
          is_banned: true,
          ban_reason: reason || 'بدون سبب',
        })
        .eq('id', Number(license_id))

      if (error) {
        return NextResponse.json(
          { success: false, message: `خطأ في قاعدة البيانات: ${error.message}` },
          { status: 500 }
        )
      }

      // محاولة تسجيل النشاط (بدون تأثير على النتيجة إذا فشل)
      try {
        await supabaseAdmin.from('activity_log').insert({
          license_id: Number(license_id),
          action: 'BAN',
          details: `الحظر: ${reason || 'بدون سبب'}`,
          ip_address: 'web',
        })
      } catch (logErr) {
        console.error('فشل تسجيل النشاط (الحظر):', logErr)
      }

      return NextResponse.json({ success: true, message: 'تم الحظر بنجاح' })
    }

    // 3. تنفيذ فك الحظر
    if (action === 'unban') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({
          is_banned: false,
          ban_reason: null,
        })
        .eq('id', Number(license_id))

      if (error) {
        return NextResponse.json(
          { success: false, message: `خطأ في قاعدة البيانات: ${error.message}` },
          { status: 500 }
        )
      }

      // محاولة تسجيل النشاط (بدون تأثير على النتيجة إذا فشل)
      try {
        await supabaseAdmin.from('activity_log').insert({
          license_id: Number(license_id),
          action: 'UNBAN',
          details: 'فك الحظر',
          ip_address: 'web',
        })
      } catch (logErr) {
        console.error('فشل تسجيل النشاط (فك الحظر):', logErr)
      }

      return NextResponse.json({ success: true, message: 'تم فك الحظر بنجاح' })
    }

    // 4. إجراء غير معروف
    return NextResponse.json(
      { success: false, message: 'إجراء غير معروف' },
      { status: 400 }
    )
  } catch (err: any) {
    console.error('خطأ في مسار الحظر:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'حدث خطأ غير متوقع' },
      { status: 500 }
    )
  }
}
