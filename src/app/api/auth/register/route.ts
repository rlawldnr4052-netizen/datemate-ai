import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    // 이메일 중복 확인
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (existing) {
      // synced 유저면 비밀번호/이름 업데이트 후 로그인 처리
      if (existing.password === 'synced') {
        const { data: updated, error: updateErr } = await supabase
          .from('users')
          .update({ name, password })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 })
        }
        return NextResponse.json({ user: updated })
      }

      return NextResponse.json({ error: '이미 등록된 이메일입니다' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, password })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
