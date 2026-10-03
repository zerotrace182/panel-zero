import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const publicOnly = searchParams.get('public') === 'true'

    let query = supabaseAdmin
      .from('distributors_public')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: false })

    if (publicOnly) {
      query = query.eq('is_visible', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      count: data?.length || 0,
      distributors: data || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      display_name,
      image_url,
      telegram_url,
      whatsapp_url,
      description,
      is_visible,
      sort_order,
      user_id,
    } = body

    if (!display_name) {
      return NextResponse.json(
        { success: false, message: 'اسم الموزع مطلوب' },
        { status: 400 }
      )
    }

    const payload: any = {
      display_name,
      image_url: image_url || null,
      telegram_url: telegram_url || null,
      whatsapp_url: whatsapp_url || null,
      description: description || null,
      is_visible: is_visible !== false,
      sort_order: parseInt(sort_order) || 0,
    }

    if (user_id) {
      payload.user_id = parseInt(user_id)
    }

    let result
    if (id) {
      result = await supabaseAdmin
        .from('distributors_public')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
    } else {
      result = await supabaseAdmin
        .from('distributors_public')
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
      distributor: result.data,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'المعرف مفقود' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('distributors_public')
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
