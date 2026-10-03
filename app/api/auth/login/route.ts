import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, password, role, balance, is_active')
      .eq('username', username)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    // تحقق من التفعيل
    if (user.is_active === false) {
      return NextResponse.json(
        { success: false, message: 'حسابك معطل، تواصل مع الإدارة' },
        { status: 403 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    // تسجيل دخول
    await supabaseAdmin.from('activity_log').insert({
      action: 'LOGIN',
      details: `تسجيل دخول: ${username}`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    return NextResponse.json({
      success: true,
      username: user.username,
      userId: user.id,
      role: user.role || 'admin',
      balance: parseFloat(user.balance || 0),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'خطأ في السيرفر: ' + error.message },
      { status: 500 }
    )
  }
}
