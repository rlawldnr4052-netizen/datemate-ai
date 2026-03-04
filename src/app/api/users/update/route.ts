import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const { userId, name } = await req.json()

    if (!userId || !name?.trim()) {
      return NextResponse.json({ error: '이름을 입력해주세요' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', userId)
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
