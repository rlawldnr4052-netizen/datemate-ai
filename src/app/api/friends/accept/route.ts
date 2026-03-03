import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json()

    // 요청 조회
    const { data: request, error: fetchError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .maybeSingle()

    if (fetchError || !request) {
      return NextResponse.json(
        { error: '요청을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 요청 상태 업데이트
    const { error: updateErr } = await supabase
      .from('friend_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // 양방향 친구 관계 생성
    const { error: insertErr } = await supabase.from('friendships').insert([
      { user_id: request.from_user_id, friend_id: request.to_user_id },
      { user_id: request.to_user_id, friend_id: request.from_user_id },
    ])

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
