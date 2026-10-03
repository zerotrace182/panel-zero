import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'بيانات خاطئة' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      username: user.username,
      userId: user.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'خطأ في السيرفر: ' + error.message },
      { status: 500 }
    )
  }
}
