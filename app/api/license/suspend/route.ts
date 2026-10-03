import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { license_id, action } = await request.json()

    if (!license_id || !action) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    if (action === 'suspend') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({ is_active: false })
        .eq('id', license_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        license_id,
        action: 'SUSPEND',
        details: 'إيقاف مؤقت للمفتاح',
        ip_address: 'web',
      })

      return NextResponse.json({
        success: true,
        message: 'تم الإيقاف المؤقت',
      })
    }

    if (action === 'activate') {
      const { error } = await supabaseAdmin
        .from('licenses')
        .update({ is_active: true })
        .eq('id', license_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        license_id,
        action: 'ACTIVATE',
        details: 'إعادة تفعيل المفتاح',
        ip_address: 'web',
      })

      return NextResponse.json({
        success: true,
        message: 'تم التفعيل',
      })
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
