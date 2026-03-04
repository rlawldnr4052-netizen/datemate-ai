import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })

  try {
    const { userId, friendId } = await req.json()

    // 양방향 삭제
    await supabase
      .from('friendships')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)

    await supabase
      .from('friendships')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', userId)

    // 관련 요청도 삭제 (양방향)
    await supabase
      .from('friend_requests')
      .delete()
      .eq('from_user_id', userId)
      .eq('to_user_id', friendId)

    await supabase
      .from('friend_requests')
      .delete()
      .eq('from_user_id', friendId)
      .eq('to_user_id', userId)

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
