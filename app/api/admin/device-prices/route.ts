import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — عرض كل الأسعار
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('device_prices')
      .select('*')
      .order('device_count', { ascending: true })

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

// POST — إضافة أو تحديث سعر
export async function POST(request: Request) {
  try {
    const { device_count, price } = await request.json()

    if (!device_count || price === undefined) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const countValue = parseInt(device_count)
    const priceValue = parseFloat(price)

    if (isNaN(countValue) || countValue < 1) {
      return NextResponse.json(
        { success: false, message: 'عدد أجهزة غير صالح' },
        { status: 400 }
      )
    }

    if (isNaN(priceValue) || priceValue < 0) {
      return NextResponse.json(
        { success: false, message: 'سعر غير صالح' },
        { status: 400 }
      )
    }

    // upsert
    const { error } = await supabaseAdmin
      .from('device_prices')
      .upsert(
        {
          device_count: countValue,
          price: priceValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_count' }
      )

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    await supabaseAdmin.from('activity_log').insert({
      action: 'UPDATE_DEVICE_PRICE',
      details: `تحديث سعر ${countValue} جهاز إلى $${priceValue}`,
      ip_address: 'web',
    })

    return NextResponse.json({
      success: true,
      message: 'تم الحفظ',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

// DELETE — حذف سعر
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const device_count = searchParams.get('device_count')

    if (!device_count) {
      return NextResponse.json(
        { success: false, message: 'عدد الأجهزة مفقود' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('device_prices')
      .delete()
      .eq('device_count', parseInt(device_count))

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
