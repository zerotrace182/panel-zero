import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

const PRESETS: Record<string, number> = {
  day1: 1,
  day3: 3,
  week1: 7,
  month1: 30,
  month2: 60,
  month3: 90,
  month6: 180,
  year1: 365,
  forever: 36500,
}

function generateKey(): string {
  const part = () => crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${part()}-${part()}-${part()}`
}

export async function POST(request: Request) {
  try {
    const { type, count, devices } = await request.json()

    const days = PRESETS[type] || 1
    const numCount = Math.min(Math.max(parseInt(count) || 1, 1), 50)
    const numDevices = Math.max(parseInt(devices) || 1, 1)

    const expires = new Date()
    expires.setDate(expires.getDate() + days)

    const keys: string[] = []

    for (let i = 0; i < numCount; i++) {
      const key = generateKey()

      const { error } = await supabaseAdmin
        .from('licenses')
        .insert({
          license_key: key,
          duration_type: type,
          duration_value: 1,
          max_devices: numDevices,
          expires_at: expires.toISOString(),
          is_active: true,
          is_banned: false,
        })

      if (error) {
        console.error('Insert error:', error)
        continue
      }

      keys.push(key)

      await supabaseAdmin.from('activity_log').insert({
        action: 'CREATE',
        details: `إنشاء مفتاح (${type})`,
        ip_address: 'web',
      })
    }

    return NextResponse.json({
      success: true,
      count: keys.length,
      keys,
      expires: expires.toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
