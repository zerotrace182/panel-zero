import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { license_id } = await request.json()

    if (!license_id) {
      return NextResponse.json(
        { success: false, message: 'معرف المفتاح مفقود' },
        { status: 400 }
      )
    }

    // حذف الأجهزة المرتبطة أولاً
    await supabaseAdmin
      .from('devices')
      .delete()
      .eq('license_id', license_id)

    // حذف سجل الأحداث
    await supabaseAdmin
      .from('activity_log')
      .delete()
      .eq('license_id', license_id)

    // حذف المفتاح
    const { error } = await supabaseAdmin
      .from('licenses')
      .delete()
      .eq('id', license_id)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'تم الحذف بنجاح',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
