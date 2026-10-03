import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegram_id, role, balance, duration_days } = body

    // التحقق من Admin
    const { data: session } = await supabaseAdmin
      .from('bot_sessions')
      .select('user_id')
      .eq('telegram_id', telegram_id)
      .maybeSingle()

    if (!session?.user_id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 403 }
      )
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.user_id)
      .maybeSingle()

    if (user?.role !== 'admin' && user?.role !== 'owner') {
      return NextResponse.json(
        { success: false, message: 'صلاحيات Admin مطلوبة' },
        { status: 403 }
      )
    }

    // توليد رمز
    const code = 'INV-' + crypto.randomBytes(4).toString('hex').toUpperCase()

    // تاريخ الانتهاء
    const expires = new Date()
    expires.setDate(expires.getDate() + parseInt(duration_days || 30))

    const { data, error } = await supabaseAdmin
      .from('invite_codes')
      .insert({
        code,
        role: role || 'distributor',
        balance: parseFloat(balance) || 0,
        expires_at: expires.toISOString(),
        is_active: true,
        created_by: session.user_id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      invite: data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
