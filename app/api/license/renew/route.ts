import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const PRESETS: Record<string, number> = {
  day1: 1,
  day3: 3,
  week1: 7,
  month1: 30,
  month2: 60,
  month3: 90,
  month6: 180,
  year1: 365,
  forever: 36500,
}

export async function POST(request: Request) {
  try {
    const { license_id, type } = await request.json()

    if (!license_id || !type) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const days = PRESETS[type]
    if (!days) {
      return NextResponse.json(
        { success: false, message: 'نوع غير صالح' },
        { status: 400 }
      )
    }

    const { data: lic, error: fetchError } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('id', license_id)
      .single()

    if (fetchError || !lic) {
      return NextResponse.json(
        { success: false, message: 'المفتاح غير موجود' },
        { status: 404 }
      )
    }

    const now = new Date()
    const currentExpiry = new Date(lic.expires_at)

    // إذا نشط → أضف للتاريخ الحالي، وإلا → ابدأ من الآن
    const base = currentExpiry > now ? currentExpiry : now
    const newExpiry = new Date(base)
    newExpiry.setDate(newExpiry.getDate() + days)

    const { error: updateError } = await supabaseAdmin
      .from('licenses')
      .update({
        expires_at: newExpiry.toISOString(),
        is_banned: false,
        ban_reason: null,
      })
      .eq('id', license_id)

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 500 }
      )
    }

    await supabaseAdmin.from('activity_log').insert({
      license_id: license_id,
      action: 'RENEW',
      details: `تجديد +${days} يوم`,
      ip_address: 'web',
    })

    return NextResponse.json({
      success: true,
      message: `تم التجديد +${days} يوم`,
      new_expiry: newExpiry.toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
