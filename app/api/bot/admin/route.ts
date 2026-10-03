import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

async function checkAdmin(telegram_id: number) {
  const { data: session } = await supabaseAdmin
    .from('bot_sessions')
    .select('user_id')
    .eq('telegram_id', telegram_id)
    .maybeSingle()

  if (!session?.user_id) return null

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', session.user_id)
    .maybeSingle()

  if (user?.role === 'admin' || user?.role === 'owner') {
    return user
  }
  return null
}

// PATCH — تعديل مستخدم (رصيد/تفعيل/تعطيل)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { telegram_id, target_user_id, action, amount } = body

    const admin = await checkAdmin(telegram_id)
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'صلاحيات Admin مطلوبة' },
        { status: 403 }
      )
    }

    if (!target_user_id || !action) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    // إضافة رصيد
    if (action === 'add_balance') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', target_user_id)
        .single()

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'المستخدم غير موجود' },
          { status: 404 }
        )
      }

      const newBalance = parseFloat(user.balance || 0) + parseFloat(amount)

      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', target_user_id)

      await supabaseAdmin.from('transactions').insert({
        user_id: target_user_id,
        amount: parseFloat(amount),
        type: 'credit',
        description: 'إضافة رصيد من البوت',
      })

      return NextResponse.json({
        success: true,
        message: `تمت الإضافة. الرصيد الجديد: $${newBalance.toFixed(2)}`,
      })
    }

    // خصم رصيد
    if (action === 'remove_balance') {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', target_user_id)
        .single()

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'المستخدم غير موجود' },
          { status: 404 }
        )
      }

      const currentBalance = parseFloat(user.balance || 0)
      const newBalance = Math.max(0, currentBalance - parseFloat(amount))

      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', target_user_id)

      await supabaseAdmin.from('transactions').insert({
        user_id: target_user_id,
        amount: -parseFloat(amount),
        type: 'debit',
        description: 'خصم رصيد من البوت',
      })

      return NextResponse.json({
        success: true,
        message: `تم الخصم. الرصيد الجديد: $${newBalance.toFixed(2)}`,
      })
    }

    // تفعيل
    if (action === 'activate') {
      await supabaseAdmin
        .from('users')
        .update({
          is_active: true,
          banned_at: null,
          ban_reason: null,
        })
        .eq('id', target_user_id)

      return NextResponse.json({ success: true, message: 'تم التفعيل' })
    }

    // تعطيل
    if (action === 'deactivate') {
      await supabaseAdmin
        .from('users')
        .update({
          is_active: false,
          banned_at: new Date().toISOString(),
          ban_reason: 'إيقاف مؤقت من البوت',
        })
        .eq('id', target_user_id)

      return NextResponse.json({ success: true, message: 'تم الإيقاف' })
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
