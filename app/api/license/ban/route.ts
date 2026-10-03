import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { license_id, action, reason } = await request.json()

    if (!license_id || !action) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    if (action === 'ban') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({
          is_banned: true,
          ban_reason: reason || 'بدون سبب',
        })
        .eq('id', license_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        license_id: license_id,
        action: 'BAN',
        details: `الحظر: ${reason || 'بدون سبب'}`,
        ip_address: 'web',
      })

      return NextResponse.json({ success: true, message: 'تم الحظر' })
    }

    if (action === 'unban') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({
          is_banned: false,
          ban_reason: null,
        })
        .eq('id', license_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        license_id: license_id,
        action: 'UNBAN',
        details: 'فك الحظر',
        ip_address: 'web',
      })

      return NextResponse.json({ success: true, message: 'تم فك الحظر' })
    }

    return NextResponse.json(
      { success: false, message: 'إجراء غير معروف' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
