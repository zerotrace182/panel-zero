import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password, invite_code } = await request.json()

    if (!username || !password || !invite_code) {
      return NextResponse.json(
        { success: false, message: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور قصيرة' },
        { status: 400 }
      )
    }

    // 1. التحقق من اسم المستخدم
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'اسم المستخدم مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // 2. التحقق من رمز الإحالة
    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', invite_code)
      .eq('is_active', true)
      .maybeSingle()

    if (inviteError || !invite) {
      return NextResponse.json(
        { success: false, message: 'رمز الإحالة غير صالح' },
        { status: 400 }
      )
    }

    // 3. التحقق من انتهاء صلاحية الرمز
    if (invite.expires_at && new Date(invite.expires_at) <= new Date()) {
      return NextResponse.json(
        { success: false, message: 'انتهت صلاحية رمز الإحالة' },
        { status: 400 }
      )
    }

    // 4. التحقق من عدم استخدام الرمز
    if (invite.used_by) {
      return NextResponse.json(
        { success: false, message: 'تم استخدام رمز الإحالة من قبل' },
        { status: 400 }
      )
    }

    // 5. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10)

    // 6. إنشاء المستخدم
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        role: invite.role || 'distributor',
        balance: invite.balance || 0,
        is_active: true,
        invited_by: invite.created_by,
        key_price: 1,
      })
      .select()
      .single()

    if (userError || !newUser) {
      return NextResponse.json(
        { success: false, message: 'فشل إنشاء الحساب: ' + (userError?.message || '') },
        { status: 500 }
      )
    }

    // 7. تحديث رمز الإحالة
    await supabaseAdmin
      .from('invite_codes')
      .update({
        used_by: newUser.id,
        used_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', invite.id)

    // 8. تسجيل الحدث
    await supabaseAdmin.from('activity_log').insert({
      action: 'REGISTER',
      details: `حساب جديد: ${username} (${invite.role})`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

    // 9. تسجيل المعاملة الأولية (الرصيد الممنوح)
    if (invite.balance && invite.balance > 0) {
      await supabaseAdmin.from('transactions').insert({
        user_id: newUser.id,
        amount: invite.balance,
        type: 'initial',
        description: 'رصيد ترحيبي من رمز الإحالة',
      })
    }

    return NextResponse.json({
      success: true,
      username: newUser.username,
      role: newUser.role,
      balance: newUser.balance,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'خطأ في السيرفر: ' + error.message },
      { status: 500 }
    )
  }
}
