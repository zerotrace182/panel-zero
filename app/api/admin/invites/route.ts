import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

// GET — عرض كل الرموز
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      count: data?.length || 0,
      invites: data || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}

// POST — إنشاء رمز جديد
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { role, balance, duration_days, created_by } = body

    if (!role || !duration_days) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    if (!['distributor', 'owner', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'نوع غير صالح' },
        { status: 400 }
      )
    }

    // توليد رمز
    const code = 'INV-' + crypto.randomBytes(4).toString('hex').toUpperCase()

    // حساب تاريخ الانتهاء
    const expires = new Date()
    expires.setDate(expires.getDate() + parseInt(duration_days))

    const { data, error } = await supabaseAdmin
      .from('invite_codes')
      .insert({
        code,
        role,
        balance: parseFloat(balance) || 0,
        expires_at: expires.toISOString(),
        is_active: true,
        created_by: created_by || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    // تسجيل الحدث
    await supabaseAdmin.from('activity_log').insert({
      action: 'CREATE_INVITE',
      details: `رمز إحالة: ${code} (${role})`,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })

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

// DELETE — حذف رمز
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف مفقود' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('invite_codes')
      .delete()
      .eq('id', id)

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
