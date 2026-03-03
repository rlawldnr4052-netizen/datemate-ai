import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const { fromUserId, toUserId } = await req.json()

    if (fromUserId === toUserId) {
      return NextResponse.json({ error: '자기 자신에게 요청할 수 없습니다' }, { status: 400 })
    }

    // 이미 친구인지 확인
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_id', fromUserId)
      .eq('friend_id', toUserId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: '이미 친구입니다' }, { status: 400 })
    }

    // 이미 대기 중인 요청 확인 (양방향)
    const { data: pending1 } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', toUserId)
      .eq('status', 'pending')
      .maybeSingle()

    const { data: pending2 } = await supabase
      .from('friend_requests')
      .select('id')
      .eq('from_user_id', toUserId)
      .eq('to_user_id', fromUserId)
      .eq('status', 'pending')
      .maybeSingle()

    if (pending1 || pending2) {
      return NextResponse.json({ error: '이미 대기 중인 요청이 있습니다' }, { status: 400 })
    }

    // 이전 거절된 요청 삭제 (재요청 가능하게)
    await supabase
      .from('friend_requests')
      .delete()
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', toUserId)
      .eq('status', 'rejected')

    const { data, error } = await supabase
      .from('friend_requests')
      .insert({ from_user_id: fromUserId, to_user_id: toUserId, status: 'pending' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
