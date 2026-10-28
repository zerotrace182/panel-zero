import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // --- التعديل الجديد: استقبال اليوزر والباس أو النص الكامل ---
    let key = body.license_key || body.key || ''
    const inputUsername = body.username || ''
    const inputPassword = body.password || ''
    
    // إذا أرسل التطبيق يوزر وباس منفصلين، نقوم بدمجهم للبحث في قاعدة البيانات
    if (inputUsername && inputPassword && !key) {
      key = `${inputUsername}:${inputPassword}`
    }
    // ---------------------------------------------------------

    const hwid = body.hwid || ''
    const game = body.game_type || '8ball'
    const ver = body.version || '1.0'

    if (!key || !hwid) {
      return NextResponse.json(
        { status: 'error', message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    // 1. البحث عن المفتاح/الحساب في قاعدة البيانات
    const { data: lic, error } = await supabaseAdmin
      .from('licenses')
      .select('*')
      .eq('license_key', key)
      .single()

    // 2. إذا لم يوجد النص المدمج، قد يكون التطبيق يرسل اليوزر فقط ونحن بحاجة للبحث
    // (هذا الخيار لتسهيل التجربة إذا كان تطبيقك يرسل اليوزر والباس كحقول منفصلة)
    let finalLic = lic;
    if (!finalLic && inputUsername) {
      // البحث عن أي مفتاح يبدأ باليوزر
      const { data: allLics } = await supabaseAdmin.from('licenses').select('*');
      const found = allLics?.find(l => l.license_key.startsWith(inputUsername + ':'));
      
      if (found) {
        // إذا وجدنا اليوزر، نتأكد من الباس
        const savedPass = found.license_key.split(':')[1];
        if (savedPass === inputPassword) {
          finalLic = found;
        }
      }
    }

    if (error || !finalLic) {
      return NextResponse.json(
        { status: 'error', message: 'بيانات الدخول غير صالحة' },
        { status: 404 }
      )
    }

    // استخدام finalLic بدلاً من lic في باقي الكود
    const license = finalLic;

    // 3. التحقق من الحظر
    if (license.is_banned) {
      return NextResponse.json(
        { status: 'error', message: 'تم حظر هذا الحساب' },
        { status: 403 }
      )
    }

    // 4. التحقق من التفعيل
    if (!license.is_active) {
      return NextResponse.json(
        { status: 'error', message: 'الحساب معطل' },
        { status: 403 }
      )
    }

    // 5. التحقق من تاريخ الانتهاء
    if (new Date(license.expires_at) <= new Date()) {
      return NextResponse.json(
        { status: 'error', message: 'انتهت صلاحية الحساب' },
        { status: 403 }
      )
    }

    // ✅ جلب IP الحقيقي
    const forwarded = request.headers.get('x-forwarded-for')
    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      (forwarded ? forwarded.split(',')[0].trim() : null) ||
      'unknown'

    // ✅ التحقق من الجهاز (HWID)
    const isGenericHwid =
      !hwid || hwid === 'default' || hwid === 'unknown' ||
      hwid.startsWith('com.') || hwid.startsWith('net.') || hwid.startsWith('org.')

    const deviceKey = isGenericHwid ? `ip-${clientIp}` : hwid

    // حساب الأجهزة الحالية
    const { count: currentCount } = await supabaseAdmin
      .from('devices')
      .select('*', { count: 'exact', head: true })
      .eq('license_id', license.id)

    let activeDevices = currentCount || 0

    // البحث عن الجهاز الحالي
    const { data: existingDevice } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('license_id', license.id)
      .eq('hwid', deviceKey)
      .maybeSingle()

    if (!existingDevice) {
      const userLimit = license.max_devices ?? 1

      if (activeDevices >= userLimit) {
        return NextResponse.json(
          { status: 'error', message: `تجاوزت عدد الأجهزة المسموح (${userLimit})` },
          { status: 403 }
        )
      }

      // تسجيل جهاز جديد
      await supabaseAdmin.from('devices').insert({
        license_id: license.id,
        hwid: deviceKey,
        ip_address: clientIp,
      })

      activeDevices += 1

      await supabaseAdmin
        .from('licenses')
        .update({ used_count: activeDevices })
        .eq('id', license.id)
    } else {
      // تحديث آخر ظهور للجهاز
      await supabaseAdmin
        .from('devices')
        .update({
          last_seen: new Date().toISOString(),
          ip_address: clientIp,
        })
        .eq('id', existingDevice.id)
    }

    // إنشاء توكن للجلسة
    const authToken = crypto.randomBytes(16).toString('hex')

    await supabaseAdmin.from('activity_log').insert({
      license_id: license.id,
      action: 'VERIFY',
      details: `Game login: ${game} v${ver} | IP: ${clientIp}`,
      ip_address: clientIp,
    })

    // النتيجة النهائية
    return NextResponse.json({
      status: 'success',
      data: {
        license_key: license.license_key,
        expiry_date: license.expires_at,
        auth_token: authToken,
        version: ver,
        max_devices: String(license.max_devices),
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
