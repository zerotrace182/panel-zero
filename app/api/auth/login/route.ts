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
      .select('id, username, password, role, balance, is_active, ban_reason')
      .eq('username', username)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    // التحقق من كلمة المرور أولاً
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    // ✅ فحص حالة الحساب (بعد التأكد من كلمة المرور)
    if (user.is_active === false) {
      const reason = user.ban_reason || ''

      // 1. إذا الحذف من قبل المطور
      if (reason === 'تم الحذف من قبل المطور') {
        return NextResponse.json(
          {
            success: false,
            message: 'تم حذف حسابك من قبل المطور',
            type: 'deleted',
            deleted: true,
            telegram: 'https://t.me/op_mf',
          },
          { status: 403 }
        )
      }

      // 2. إذا انتهى الرصيد (طرد تلقائي)
      if (reason === 'الرصيد = صفر' || reason.includes('رصيد غير كافٍ') || reason === 'انتهى الرصيد') {
        return NextResponse.json(
          {
            success: false,
            message: 'انتهى رصيدك، تواصل مع المطور للتجديد',
            type: 'no_balance',
            banned: true,
            telegram: 'https://t.me/op_mf',
          },
          { status: 403 }
        )
      }

      // 3. إيقاف مؤقت من الإدارة
      if (reason === 'تم التعطيل من قبل الإدارة' || reason === 'إيقاف مؤقت') {
        return NextResponse.json(
          {
            success: false,
            message: 'حسابك موقوف مؤقتاً، تواصل مع الإدارة',
            type: 'suspended',
            banned: true,
            telegram: 'https://t.me/op_mf',
          },
          { status: 403 }
        )
      }

      // 4. تعطيل عام (أي سبب آخر)
      return NextResponse.json(
        {
          success: false,
          message: reason || 'حسابك معطل، تواصل مع الإدارة',
          type: 'banned',
          banned: true,
          telegram: 'https://t.me/op_mf',
        },
        { status: 403 }
      )
    }

    // تسجيل دخول ناجح
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
