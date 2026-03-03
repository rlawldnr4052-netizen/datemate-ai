import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // 이메일로 유저 찾기
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json(
        { error: '계정을 찾을 수 없습니다. 회원가입해주세요.' },
        { status: 401 }
      )
    }

    // synced 유저: 아무 비밀번호나 허용 후 실제 비밀번호로 업데이트
    if (user.password === 'synced') {
      await supabase
        .from('users')
        .update({ password })
        .eq('id', user.id)
      return NextResponse.json({ user })
    }

    // 비밀번호 확인
    if (user.password !== password) {
      return NextResponse.json(
        { error: '비밀번호가 올바르지 않습니다' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
