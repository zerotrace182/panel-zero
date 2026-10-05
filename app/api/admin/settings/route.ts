import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - جلب الإعدادات
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (!key) {
      return NextResponse.json({ status: 'error', message: 'المفتاح مفقود' }, { status: 400 })
    }
    
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('key', key)
      .maybeSingle()
    
    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      key: key,
      enabled: data?.enabled || false,
      min_balance: parseFloat(data?.value || '10')
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
  }
}

// POST - حفظ الإعدادات
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { key, enabled, min_balance } = body
    
    if (!key) {
      return NextResponse.json({ success: false, message: 'المفتاح مفقود' }, { status: 400 })
    }
    
    const { data: existing } = await supabaseAdmin
      .from('settings')
      .select('id')
      .eq('key', key)
      .maybeSingle()
    
    let result
    if (existing) {
      result = await supabaseAdmin
        .from('settings')
        .update({ enabled: enabled, value: String(min_balance) })
        .eq('key', key)
    } else {
      result = await supabaseAdmin
        .from('settings')
        .insert({ key: key, enabled: enabled, value: String(min_balance) })
    }
    
    if (result.error) {
      return NextResponse.json({ success: false, message: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'تم الحفظ' })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 })
  }
}
