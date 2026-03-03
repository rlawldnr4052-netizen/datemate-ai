import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const currentUserId = searchParams.get('userId') || ''

  if (!q.trim()) {
    return NextResponse.json({ users: [] })
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, profile_image_url, created_at')
    .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
    .neq('id', currentUserId)
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data })
}
