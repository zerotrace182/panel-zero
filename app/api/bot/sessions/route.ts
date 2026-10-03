import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — جلب جلسة بواسطة telegram_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegram_id = searchParams.get('telegram_id')

    if (!telegram_id) {
      return NextResponse.json(
        { status: 'error', message: 'telegram_id مطلوب' },
        { status: 400 }
      )
    }

    const { data: session, error } = await supabaseAdmin
      .from('bot_sessions')
      .select('*')
      .eq('telegram_id', telegram_id)
      .maybeSingle()

    if (error || !session) {
      return NextResponse.json({
        status: 'error',
        message: 'الجلسة غير موجودة',
      })
    }

    // جلب بيانات المستخدم
    let userData = null
    if (session.user_id) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, username, role, balance, is_active')
        .eq('id', session.user_id)
        .maybeSingle()

      userData = user
    } else if (session.username) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, username, role, balance, is_active')
        .eq('username', session.username)
        .maybeSingle()

      userData = user
    }

    return NextResponse.json({
      status: 'success',
      session: {
        telegram_id: session.telegram_id,
        user_id: session.user_id,
        username: session.username,
        logged_in: session.logged_in,
        login_at: session.login_at,
      },
      username: userData?.username || session.username || '—',
      role: userData?.role || 'distributor',
      balance: userData?.balance || 0,
      is_active: userData?.is_active !== false,
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}

// POST — إنشاء/تحديث جلسة
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { telegram_id, user_id, username, logged_in } = body

    if (!telegram_id) {
      return NextResponse.json(
        { success: false, message: 'telegram_id مطلوب' },
        { status: 400 }
      )
    }

    // البحث عن جلسة موجودة
    const { data: existing } = await supabaseAdmin
      .from('bot_sessions')
      .select('id')
      .eq('telegram_id', telegram_id)
      .maybeSingle()

    const payload: any = {
      telegram_id: parseInt(telegram_id),
      user_id: user_id ? parseInt(user_id) : null,
      username: username || null,
      logged_in: logged_in !== false,
      login_at: new Date().toISOString(),
    }

    let result
    if (existing) {
      // تحديث
      result = await supabaseAdmin
        .from('bot_sessions')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // إنشاء
      result = await supabaseAdmin
        .from('bot_sessions')
        .insert(payload)
        .select()
        .single()
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session: result.data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

// DELETE — حذف جلسة (خروج)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const telegram_id = searchParams.get('telegram_id')

    if (!telegram_id) {
      return NextResponse.json(
        { success: false, message: 'telegram_id مطلوب' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('bot_sessions')
      .delete()
      .eq('telegram_id', telegram_id)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'تم الحذف' })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
