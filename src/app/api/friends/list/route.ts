import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') || ''
  const type = searchParams.get('type') || 'friends'

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    if (type === 'friends') {
      // 1) 친구 관계 가져오기
      const { data: friendships, error: fErr } = await supabase
        .from('friendships')
        .select('id, friend_id, connected_at')
        .eq('user_id', userId)

      if (fErr) {
        return NextResponse.json({ error: fErr.message }, { status: 500 })
      }

      if (!friendships || friendships.length === 0) {
        return NextResponse.json({ friends: [] })
      }

      // 2) 친구 유저 정보 가져오기
      const friendIds = friendships.map((f) => f.friend_id)
      const { data: users, error: uErr } = await supabase
        .from('users')
        .select('id, name, email, profile_image_url')
        .in('id', friendIds)

      if (uErr) {
        return NextResponse.json({ error: uErr.message }, { status: 500 })
      }

      const userMap = new Map((users || []).map((u) => [u.id, u]))
      const friends = friendships.map((f) => ({
        id: f.id,
        friend_id: f.friend_id,
        connected_at: f.connected_at,
        friend: userMap.get(f.friend_id) || null,
      })).filter((f) => f.friend !== null)

      return NextResponse.json({ friends })
    }

    if (type === 'received') {
      // 받은 친구 요청
      const { data: requests, error: rErr } = await supabase
        .from('friend_requests')
        .select('id, from_user_id, to_user_id, status, created_at')
        .eq('to_user_id', userId)
        .eq('status', 'pending')

      if (rErr) {
        return NextResponse.json({ error: rErr.message }, { status: 500 })
      }

      if (!requests || requests.length === 0) {
        return NextResponse.json({ requests: [] })
      }

      const fromIds = requests.map((r) => r.from_user_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, profile_image_url')
        .in('id', fromIds)

      const userMap = new Map((users || []).map((u) => [u.id, u]))
      const result = requests.map((r) => ({
        ...r,
        from_user: userMap.get(r.from_user_id) || null,
      }))

      return NextResponse.json({ requests: result })
    }

    if (type === 'sent') {
      // 보낸 친구 요청
      const { data: requests, error: rErr } = await supabase
        .from('friend_requests')
        .select('id, from_user_id, to_user_id, status, created_at')
        .eq('from_user_id', userId)
        .eq('status', 'pending')

      if (rErr) {
        return NextResponse.json({ error: rErr.message }, { status: 500 })
      }

      if (!requests || requests.length === 0) {
        return NextResponse.json({ requests: [] })
      }

      const toIds = requests.map((r) => r.to_user_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, profile_image_url')
        .in('id', toIds)

      const userMap = new Map((users || []).map((u) => [u.id, u]))
      const result = requests.map((r) => ({
        ...r,
        to_user: userMap.get(r.to_user_id) || null,
      }))

      return NextResponse.json({ requests: result })
    }

    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
