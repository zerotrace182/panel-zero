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

    const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 5000)
    const numDevices = Math.max(parseInt(devices) || 1, 1)

    // 1. سعر النوع
    const { data: typePriceRow } = await supabaseAdmin
      .from('key_prices')
      .select('price')
      .eq('duration_type', type)
      .maybeSingle()

    const typePrice = parseFloat(typePriceRow?.price || 1)

    // 2. سعر الأجهزة
    const { data: devicePriceRow } = await supabaseAdmin
      .from('device_prices')
      .select('price')
      .eq('device_count', numDevices)
      .maybeSingle()

    let devicePrice = 0
    if (devicePriceRow) {
      devicePrice = parseFloat(devicePriceRow.price)
    } else {
      const { data: closest } = await supabaseAdmin
        .from('device_prices')
        .select('device_count, price')
        .lte('device_count', numDevices)
        .order('device_count', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (closest) {
        devicePrice = parseFloat(closest.price)
      } else {
        const { data: lowest } = await supabaseAdmin
          .from('device_prices')
          .select('price')
          .order('device_count', { ascending: true })
          .limit(1)
          .maybeSingle()
        devicePrice = parseFloat(lowest?.price || 1)
      }
    }

    // 3. السعر الإجمالي
    const pricePerKey = typePrice + devicePrice
    const totalCost = pricePerKey * numCount

    // 4. جلب المستخدم
    let user: any = null
    let isDistributor = false
    let isOwner = false

    if (username) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id, role, balance, is_active')
        .eq('username', username)
        .maybeSingle()

      user = data

      if (user) {
        // 🆕 المالك فقط لا يُخصم منه
        isOwner = (user.role === 'owner')
        
        // الموزع والمدير يُخصم منهم عادي
        if (!isOwner) {
          isDistributor = true

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

          const currentBalance = parseFloat(user.balance || 0)

          if (currentBalance <= 0) {
            await supabaseAdmin
              .from('users')
              .update({
                is_active: false,
                banned_at: new Date().toISOString(),
                ban_reason: 'الرصيد = صفر',
              })
              .eq('id', user.id)

            await supabaseAdmin.from('activity_log').insert({
              action: 'AUTO_BAN',
              details: `تعطيل تلقائي: ${username} — الرصيد صفر`,
              ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            })

            await supabaseAdmin.from('transactions').insert({
              user_id: user.id,
              amount: 0,
              type: 'auto_ban',
              description: 'تعطيل الحساب: الرصيد صفر',
            })

            return NextResponse.json(
              {
                success: false,
                message: 'انتهى رصيدك، تم تعطيل حسابك',
                banned: true,
                telegram: 'https://t.me/op_mf',
                balance: currentBalance,
                required: totalCost,
              },
              { status: 403 }
            )
          }

          if (currentBalance < totalCost) {
            await supabaseAdmin
              .from('users')
              .update({
                is_active: false,
                banned_at: new Date().toISOString(),
                ban_reason: `رصيد غير كافٍ (${currentBalance.toFixed(2)}$ من ${totalCost.toFixed(2)}$)`,
              })
              .eq('id', user.id)

            await supabaseAdmin.from('activity_log').insert({
              action: 'AUTO_BAN',
              details: `تعطيل تلقائي: ${username} — الرصيد ${currentBalance.toFixed(2)}$ أقل من السعر ${totalCost.toFixed(2)}$`,
              ip_address: request.headers.get('x-forwarded-for') || 'unknown',
            })

            await supabaseAdmin.from('transactions').insert({
              user_id: user.id,
              amount: 0,
              type: 'auto_ban',
              description: `تعطيل الحساب: الرصيد ${currentBalance.toFixed(2)}$ غير كافٍ`,
            })

            return NextResponse.json(
              {
                success: false,
                message: `انتهى رصيدك (${currentBalance.toFixed(2)}$)، السعر المطلوب ${totalCost.toFixed(2)}$. تم تعطيل حسابك`,
                banned: true,
                telegram: 'https://t.me/op_mf',
                balance: currentBalance,
                required: totalCost,
              },
              { status: 403 }
            )
          }

          // التحقق من الحد الأدنى
          try {
            const { data: protectionSetting } = await supabaseAdmin
              .from('settings')
              .select('enabled, value')
              .eq('key', 'protection')
              .maybeSingle()

            const protectionEnabled = protectionSetting?.enabled || false
            const minBalance = parseFloat(protectionSetting?.value || '10')
            const balanceAfterPurchase = currentBalance - totalCost

            if (protectionEnabled && balanceAfterPurchase < minBalance) {
              await supabaseAdmin
                .from('users')
                .update({
                  is_active: false,
                  banned_at: new Date().toISOString(),
                  ban_reason: `رصيد غير كافٍ - الحد الأدنى ${minBalance}$`,
                })
                .eq('id', user.id)

              await supabaseAdmin.from('activity_log').insert({
                action: 'AUTO_BAN',
                details: `إيقاف تلقائي: ${username} — الرصيد بعد الشراء ${balanceAfterPurchase.toFixed(2)}$ أقل من الحد الأدنى ${minBalance}$`,
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
              })

              return NextResponse.json(
                {
                  success: false,
                  message: `رصيدك سينخفض عن الحد الأدنى (${minBalance}$). تم إيقاف حسابك، تواصل مع المالك للتجديد`,
                  banned: true,
                  telegram: 'https://t.me/op_mf',
                  balance: currentBalance,
                  min_balance: minBalance,
                },
                { status: 403 }
              )
            }
          } catch (protectionErr) {
            console.error('Protection check error:', protectionErr)
          }
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
        used_count: 0,
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
        details: `إنشاء مفتاح (${type}) - ${numDevices} جهاز - $${pricePerKey} - بواسطة: ${username || 'غير معروف'}`,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      })
    }

    // 6. خصم الرصيد (فقط إذا ليس owner)
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
        description: `شراء ${keys.length} مفتاح (${type}، ${numDevices} جهاز)`,
      })
    }

    return NextResponse.json({
      success: true,
      count: keys.length,
      keys,
      expires: expires.toISOString(),
      cost: isDistributor ? pricePerKey * keys.length : 0,
      price_per_key: pricePerKey,
      type_price: typePrice,
      device_price: devicePrice,
      free_for_owner: isOwner,  // 🆕 إشارة للبوت
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
