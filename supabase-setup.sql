-- DateMate Supabase 테이블 설정
-- Supabase 대시보드 → SQL Editor에서 이 스크립트를 실행하세요

-- 1. 유저 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 친구 요청 테이블
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 친구 관계 테이블
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- 4. RLS 활성화 + 퍼블릭 정책 (앱 자체 인증 사용)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "friend_requests_all" ON public.friend_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "friendships_all" ON public.friendships FOR ALL USING (true) WITH CHECK (true);

-- 5. 인덱스
CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON public.friend_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON public.friend_requests(from_user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON public.friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON public.friendships(friend_id);
