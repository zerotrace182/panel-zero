import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let query = supabaseAdmin
      .from('licenses')
      .select('*')
      .order('id', { ascending: false })
      .limit(1000)

    if (filter === 'active') {
      query = query.eq('is_banned', false)
    } else if (filter === 'banned') {
      query = query.eq('is_banned', true)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    // ✅ نضيف used_count مباشرة بدون استعلامات إضافية
    const licenses = (data || []).map((l) => ({
      ...l,
      used_count: l.used_count ?? 0,
      device_count: l.used_count ?? 0, // للتوافق مع الواجهة القديمة
    }))

    return NextResponse.json({
      status: 'success',
      count: licenses.length,
      licenses,
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
