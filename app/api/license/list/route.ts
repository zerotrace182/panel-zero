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
      .limit(500)

    // فلترة
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

    // حساب عدد الأجهزة
    const licensesWithDevices = await Promise.all(
      (data || []).map(async (l) => {
        const { count } = await supabaseAdmin
          .from('devices')
          .select('*', { count: 'exact', head: true })
          .eq('license_id', l.id)

        return {
          ...l,
          device_count: count || 0,
        }
      })
    )

    return NextResponse.json({
      status: 'success',
      count: licensesWithDevices.length,
      licenses: licensesWithDevices,
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
