import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { id, name, email, password } = await req.json()

    if (!id || !email) {
      return NextResponse.json({ error: 'id, email 필수' }, { status: 400 })
    }

    // 이미 존재하는지 확인
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ synced: true, exists: true })
    }

    // 이메일로도 확인 (다른 ID로 같은 이메일이 있을 수 있음)
    const { data: emailUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (emailUser) {
      // 이메일이 이미 있으면 해당 ID를 반환
      return NextResponse.json({ synced: true, exists: true, actualId: emailUser.id })
    }

    // 새로 생성
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        name: name || '사용자',
        email,
        password: password || 'synced',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ synced: true, created: true, user: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
