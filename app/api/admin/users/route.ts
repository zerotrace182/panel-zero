import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET — عرض الموزعين فقط (بدون Admin/Owner)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, role, balance, is_active, invited_by, key_price, created_at, banned_at, ban_reason')
      .eq('role', 'distributor')
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'success',
      count: data?.length || 0,
      users: data || [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}

// PATCH — تعديل مستخدم (تفعيل/إيقاف مؤقت/رصيد)
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { user_id, action, amount } = body

    if (!user_id || !action) {
      return NextResponse.json(
        { success: false, message: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    // 1. تفعيل المستخدم
    if (action === 'activate') {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_active: true,
          banned_at: null,
          ban_reason: null,
        })
        .eq('id', user_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        action: 'ACTIVATE_USER',
        details: `تفعيل مستخدم #${user_id}`,
        ip_address: 'web',
      })

      return NextResponse.json({ success: true, message: 'تم التفعيل' })
    }

    // 2. إيقاف مؤقت (Suspend)
    if (action === 'deactivate') {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          is_active: false,
          banned_at: new Date().toISOString(),
          ban_reason: 'إيقاف مؤقت',
        })
        .eq('id', user_id)

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        )
      }

      await supabaseAdmin.from('activity_log').insert({
        action: 'SUSPEND_USER',
        details: `إيقاف مؤقت لمستخدم #${user_id}`,
        ip_address: 'web',
      })

      return NextResponse.json({ success: true, message: 'تم الإيقاف المؤقت' })
    }

    // 3. إضافة رصيد
    if (action === 'add_balance') {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, message: 'مبلغ غير صالح' },
          { status: 400 }
        )
      }

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', user_id)
        .single()

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'المستخدم غير موجود' },
          { status: 404 }
        )
      }

      const newBalance = parseFloat(user.balance || 0) + parseFloat(amount)

      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user_id)

      await supabaseAdmin.from('transactions').insert({
        user_id,
        amount: parseFloat(amount),
        type: 'credit',
        description: 'إضافة رصيد من الإدارة',
      })

      await supabaseAdmin.from('activity_log').insert({
        action: 'ADD_BALANCE',
        details: `إضافة $${amount} للمستخدم #${user_id}`,
        ip_address: 'web',
      })

      return NextResponse.json({
        success: true,
        message: `تمت الإضافة. الرصيد الجديد: $${newBalance.toFixed(2)}`,
      })
    }

    // 4. خصم رصيد
    if (action === 'remove_balance') {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, message: 'مبلغ غير صالح' },
          { status: 400 }
        )
      }

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('balance')
        .eq('id', user_id)
        .single()

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'المستخدم غير موجود' },
          { status: 404 }
        )
      }

      const currentBalance = parseFloat(user.balance || 0)
      const newBalance = Math.max(0, currentBalance - parseFloat(amount))

      await supabaseAdmin
        .from('users')
        .update({ balance: newBalance })
        .eq('id', user_id)

      await supabaseAdmin.from('transactions').insert({
        user_id,
        amount: -parseFloat(amount),
        type: 'debit',
        description: 'خصم رصيد من الإدارة',
      })

      await supabaseAdmin.from('activity_log').insert({
        action: 'REMOVE_BALANCE',
        details: `خصم $${amount} من المستخدم #${user_id}`,
        ip_address: 'web',
      })

      return NextResponse.json({
        success: true,
        message: `تم الخصم. الرصيد الجديد: $${newBalance.toFixed(2)}`,
      })
    }

    return NextResponse.json(
      { success: false, message: 'إجراء غير معروف' },
      { status: 400 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

// DELETE — حذف دائم للمستخدم
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'معرف مفقود' },
        { status: 400 }
      )
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, role')
      .eq('id', id)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    if (user.role === 'admin' || user.role === 'owner') {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف حساب المدير أو المالك' },
        { status: 400 }
      )
    }

    // حذف المعاملات المرتبطة
    await supabaseAdmin.from('transactions').delete().eq('user_id', id)
    
    // حذف الأكواد المرتبطة
    await supabaseAdmin.from('licenses').delete().eq('created_by_user', id)

    // حذف المستخدم نفسه
    const { error } = await supabaseAdmin.from('users').delete().eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    await supabaseAdmin.from('activity_log').insert({
      action: 'DELETE_USER',
      details: `حذف نهائي: ${user.username}`,
      ip_address: 'web',
    })

    return NextResponse.json({
      success: true,
      message: 'تم الحذف النهائي',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}

    // جلب المستخدم
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, username, role')
      .eq('id', id)
      .maybeSingle()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      )
    }

    // حماية Admin/Owner
    if (user.role === 'admin' || user.role === 'owner') {
      return NextResponse.json(
        { success: false, message: 'لا يمكن حذف حساب المدير أو المالك' },
        { status: 400 }
      )
    }

    // ✅ الحذف الناعم: تعطيل بدل حذف فعلي
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_active: false,
        banned_at: new Date().toISOString(),
        ban_reason: 'تم الحذف من قبل المطور',
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    await supabaseAdmin.from('activity_log').insert({
      action: 'DELETE_USER',
      details: `حذف مستخدم: ${user.username}`,
      ip_address: 'web',
    })

    return NextResponse.json({
      success: true,
      message: 'تم حذف المستخدم',
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    )
  }
}
