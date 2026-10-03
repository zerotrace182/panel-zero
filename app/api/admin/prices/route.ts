import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — عرض كل الأسعار
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('key_prices')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      count: data?.length || 0,
      prices: data || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}

// POST — تحديث سعر واحد
export async function POST(request: Request) {
  try {
    const { duration_type, price } = await request.json()

    if (!duration_type || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const priceValue = parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { success: false, message: 'سعر غير صالح' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('key_prices')
      .update({ price: priceValue, updated_at: new Date().toISOString() })
      .eq('duration_type', duration_type)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    await supabaseAdmin.from('activity_log').insert({
      action: 'UPDATE_PRICE',
      details: `تحديث سعر ${duration_type} إلى $${priceValue}`,
      ip_address: 'web',
    })

    return NextResponse.json({
      success: true,
      message: 'تم تحديث السعر',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
