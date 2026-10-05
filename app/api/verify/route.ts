import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const key = body.license_key || body.key || ''
    const hwid = body.hwid || ''
    const game = body.game_type || '8ball'
    const ver = body.version || '1.0'

    if (!key || !hwid) {
      return NextResponse.json(
        { status: 'error', message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const { data: lic, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('license_key', key)
      .single()

    if (error || !lic) {
      return NextResponse.json(
        { status: 'error', message: 'كود غير صالح' },
        { status: 404 }
      )
    }

    if (lic.is_banned) {
      return NextResponse.json(
        { status: 'error', message: 'تم حظر هذا الكود' },
        { status: 403 }
      )
    }

    if (!lic.is_active) {
      return NextResponse.json(
        { status: 'error', message: 'الكود معطل' },
        { status: 403 }
      )
    }

    if (new Date(lic.expires_at) <= new Date()) {
      return NextResponse.json(
        { status: 'error', message: 'انتهت صلاحية الكود' },
        { status: 403 }
      )
    }

    // ✅ جلب IP الحقيقي (يدعم Cloudflare + بروكسيات)
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp =
      request.headers.get('cf-connecting-ip') ||         // Cloudflare
      request.headers.get('x-real-ip') ||
      (forwarded ? forwarded.split(',')[0].trim() : null) ||
      'unknown'

    // ✅ لو hwid = اسم حزمة التطبيق (غير فريد)، نستخدم IP بدل منه
    const isGenericHwid =
      !hwid ||
      hwid === 'default' ||
      hwid === 'unknown' ||
      hwid.startsWith('com.') ||
      hwid.startsWith('net.') ||
      hwid.startsWith('org.')

    const deviceKey = isGenericHwid ? `ip-${clientIp}` : hwid

    // ✅ نحسب العداد من جدول devices مباشرة (مضمون أكثر من used_count)
    const { count: currentCount } = await supabaseAdmin
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('license_id', lic.id)

    let activeDevices = currentCount || 0

    // التحقق من الجهاز
    const { data: existingDevice } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('license_id', lic.id)
      .eq('hwid', deviceKey)
      .maybeSingle()

    if (!existingDevice) {
      // ✅ الحد الأقصى
      const userLimit = lic.max_devices ?? 1

      if (activeDevices >= userLimit) {
        return NextResponse.json(
          {
            status: 'error',
            message: `تجاوزت عدد الأجهزة المسموح (${userLimit})`,
          },
          { status: 403 }
        )
      }

      // سجل الجهاز الجديد
      await supabaseAdmin.from('devices').insert({
        license_id: lic.id,
        hwid: deviceKey,
        ip_address: clientIp,
      })

      activeDevices += 1

      // ✅ نحدث العداد أيضاً (احتياط، لو التريجر ما اشتغل)
      await supabaseAdmin
        .from('licenses')
        .update({ used_count: activeDevices })
        .eq('id', lic.id)
    } else {
      // جهاز موجود → حدّث آخر ظهور فقط
      await supabaseAdmin
        .from('devices')
        .update({
          last_seen: new Date().toISOString(),
          ip_address: clientIp,
        })
        .eq('id', existingDevice.id)
    }

    const authToken = crypto.randomBytes(16).toString('hex')

    await supabaseAdmin.from('activity_log').insert({
      license_id: lic.id,
      action: 'VERIFY',
      details: `Game login: ${game} v${ver} | IP: ${clientIp}`,
      ip_address: clientIp,
    })

    return NextResponse.json({
      status: 'success',
      data: {
        license_key: key,
        expiry_date: lic.expires_at,
        auth_token: authToken,
        version: ver,
        max_devices: String(lic.max_devices),
        active_devices: String(activeDevices),
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: 'Server error: ' + err.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'error',
    message: 'يجب استخدام POST',
  })
}
