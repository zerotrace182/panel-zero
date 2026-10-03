import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { status: 'error', message: 'اسم المستخدم مفقود' },
        { status: 400 }
      )
    }

    // 1. جلب المستخدم
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, balance, role, is_active')
      .eq('username', username)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json(
        { status: 'error', message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // 2. جلب مفاتيح الموزع فقط
    const { data: keys } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('created_by_user', user.id)
      .order('id', { ascending: false })

    const keysWithDevices = await Promise.all(
      (keys || []).map(async (l) => {
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

    // 3. حساب الإحصائيات
    const totalKeys = keysWithDevices.length
    const activeKeys = keysWithDevices.filter(l => {
      if (!l.expires_at) return false
      const exp = new Date(l.expires_at)
      return !isNaN(exp.getTime()) && exp > new Date() && l.is_active && !l.is_banned
    }).length
    const expiredKeys = keysWithDevices.filter(l => {
      if (!l.expires_at) return false
      const exp = new Date(l.expires_at)
      return !isNaN(exp.getTime()) && exp <= new Date() && !l.is_banned
    }).length
    const bannedKeys = keysWithDevices.filter(l => l.is_banned).length

    return NextResponse.json({
      status: 'success',
      stats: {
        balance: parseFloat(user.balance || 0),
        totalKeys,
        activeKeys,
        expiredKeys,
        bannedKeys,
        isActive: user.is_active,
      },
      keys: keysWithDevices,
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
