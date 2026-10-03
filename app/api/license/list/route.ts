import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .order('id', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    // حساب عدد الأجهزة لكل مفتاح
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
