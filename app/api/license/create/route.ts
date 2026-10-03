import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const PRESETS: Record<string, number> = {
  day1: 1, day3: 3, week1: 7, month1: 30, month2: 60,
  month3: 90, month6: 180, year1: 365, forever: 36500,
}

function generateKey(): string {
  const part = () => crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${part()}-${part()}-${part()}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, count, devices, username } = body

    const days = PRESETS[type]
    if (!days) {
      return NextResponse.json(
        { success: false, message: 'نوع مدة غير صالح' },
        { status: 400 }
      )
    }

    const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 50)
    const numDevices = Math.max(parseInt(devices) || 1, 1)

    // 1. سعر النوع
    const { data: priceRow } = await supabaseAdmin
      .from('key_prices')
      .select('price')
      .eq('duration_type', type)
      .maybeSingle()

    const pricePerKey = parseFloat(priceRow?.price || 1)
    const totalCost = pricePerKey * numCount

    // 2. جلب المستخدم
    let user: any = null
    let isDistributor = false

    if (username) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id, role, balance, is_active')
        .eq('username', username)
        .maybeSingle()

      user = data

      if (user && (user.role === 'distributor' || user.role === 'owner')) {
        isDistributor = true

        // 3. تعطيل الحساب إن كان معطل
        if (!user.is_active) {
          return NextResponse.json(
            {
              success: false,
              message: 'حسابك معطل',
              banned: true,
              telegram: 'https://t.me/op_mf',
            },
            { status: 403 }
          )
        }

        // 4. الرصيد غير كافٍ — طرد
        if (parseFloat(user.balance || 0) < totalCost) {
          // تعطيل الحساب
          await supabaseAdmin
            .from('users')
            .update({
              is_active: false,
              banned_at: new Date().toISOString(),
              ban_reason: 'انتهى الرصيد',
            })
            .eq('id', user.id)

          await supabaseAdmin.from('activity_log').insert({
            action: 'AUTO_BAN',
            details: `تعطيل تلقائي: ${username} - الرصيد غير كافٍ`,
            ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          })

          return NextResponse.json(
            {
              success: false,
              message: 'انتهى رصيدك، تم تعطيل حسابك',
              banned: true,
              telegram: 'https://t.me/op_mf',
            },
            { status: 403 }
          )
        }
      }
    }

    // 5. توليد المفاتيح
    const expires = new Date()
    expires.setDate(expires.getDate() + days)

    const keys: string[] = []

    for (let i = 0; i < numCount; i++) {
      const key = generateKey()

      const { error } = await supabaseAdmin.from('licenses').insert({
        license_key: key,
        duration_type: type,
        duration_value: 1,
        max_devices: numDevices,
        expires_at: expires.toISOString(),
        is_active: true,
        is_banned: false,
        created_by_user: user?.id || null,
        cost: pricePerKey,
      })

      if (error) {
        console.error('Insert error:', error)
        continue
      }

      keys.push(key)

      await supabaseAdmin.from('activity_log').insert({
        action: 'CREATE',
        details: `إنشاء مفتاح (${type}) - $${pricePerKey}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      })
    }

    // 6. خصم الرصيد
    if (isDistributor && user && keys.length > 0) {
      const actualCost = pricePerKey * keys.length
      const newBalance = parseFloat(user.balance || 0) - actualCost

      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user.id)

      await supabaseAdmin.from('transactions').insert({
        user_id: user.id,
        amount: -actualCost,
        type: 'purchase',
        description: `شراء ${keys.length} مفتاح (${type})`,
      })
    }

    return NextResponse.json({
      success: true,
      count: keys.length,
      keys,
      expires: expires.toISOString(),
      cost: isDistributor ? pricePerKey * keys.length : 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
