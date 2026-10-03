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
      .select('id, balance')
      .eq('username', username)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json(
        { status: 'error', message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // 2. جلب المعاملات
    const { data: transactions, error } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('id', { ascending: false })
      .limit(200)

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      balance: parseFloat(user.balance || 0),
      count: transactions?.length || 0,
      transactions: transactions || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
