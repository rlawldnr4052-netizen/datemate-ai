'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  MapPin,
  ChevronRight,
  Navigation,
  Send,
  ArrowLeft,
} from 'lucide-react'
import { FeedPost } from '@/types/feed'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'

/* ───────── Single Feed Item (carousel + actions + comments) ───────── */
export function FeedItem({ postId }: { postId: string }) {
  const router = useRouter()
  const { toggleLike, addComment } = useFeedStore()
  const { currentUser } = useAuthStore()
  const post = useFeedStore((s) => s.posts.find((p) => p.id === postId))

  const [currentIndex, setCurrentIndex] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [showAllComments, setShowAllComments] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  if (!post) return null

  const totalSlides = post.photos.length + 1

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < totalSlides - 1) {
        setCurrentIndex((i) => i + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((i) => i - 1)
      }
    }
  }

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLike(post.id)
      setLikeAnim(true)
      setTimeout(() => setLikeAnim(false), 800)
    }
  }

  const openNaverMap = (placeName: string) => {
    window.open(
      `https://map.naver.com/v5/search/${encodeURIComponent(placeName)}`,
      '_blank',
    )
  }

  const handleSubmitComment = () => {
    if (!commentText.trim() || !currentUser) return
    addComment(post.id, currentUser.id, currentUser.name, commentText.trim())
    setCommentText('')
  }

  const goToCourse = () => {
    router.push(`/course/${post.courseId}`)
  }

  const visibleComments = showAllComments
    ? post.comments || []
    : (post.comments || []).slice(-2)

  return (
    <article className="border-b border-neutral-100">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center">
          <span className="text-white text-[11px] font-bold">
            {post.userName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900 truncate">
            {post.userName}
          </p>
          <p className="text-[11px] text-neutral-400">{post.courseRegion}</p>
        </div>
      </div>

      {/* ── Carousel (4:5) ── */}
      <div
        className="relative overflow-hidden bg-neutral-100"
        style={{ aspectRatio: '4/5' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleTap}
      >
        <motion.div
          className="flex h-full"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {post.photos.map((photo) => (
            <div key={photo.id} className="flex-shrink-0 min-w-full h-full relative">
              <div
                className="w-full h-full bg-cover bg-center bg-neutral-200"
                style={{ backgroundImage: `url(${photo.imageUrl})` }}
              />
              {photo.placeName && (
                <button
                  onClick={() => openNaverMap(photo.placeName)}
                  className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 active:scale-95 transition-transform"
                >
                  <MapPin className="w-3 h-3 text-white" />
                  <span className="text-white text-[12px] font-medium">
                    {photo.placeName}
                  </span>
                </button>
              )}
            </div>
          ))}

          {/* Last slide: course info */}
          <div className="flex-shrink-0 min-w-full h-full flex items-center justify-center p-8 bg-neutral-50">
            <div className="w-full max-w-xs">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center mx-auto mb-3">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-neutral-900 text-[18px] font-bold mb-1">
                  {post.courseTitle}
                </h3>
                <p className="text-neutral-400 text-[13px]">
                  {post.courseRegion} · {post.photos.length}곳
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {post.photos.filter((p) => p.placeName).map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => openNaverMap(photo.placeName)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-neutral-100 active:bg-neutral-50 transition-colors text-left"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-neutral-800 text-[13px] font-medium flex-1 truncate">
                      {photo.placeName}
                    </span>
                    <MapPin className="w-3.5 h-3.5 text-neutral-300" />
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={goToCourse}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold text-[14px] flex items-center justify-center gap-1.5"
              >
                이 코스 따라하기
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Double-tap heart animation */}
        <AnimatePresence>
          {likeAnim && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-20 h-20 text-white fill-white drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dots indicator */}
        {totalSlides > 1 && (
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                className={`h-[5px] rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-[18px] bg-primary-500'
                    : 'w-[5px] bg-black/20'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ── */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleLike(post.id)}>
          <Heart
            className={`w-6 h-6 transition-colors ${
              post.isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-800'
            }`}
          />
        </motion.button>
        <motion.button whileTap={{ scale: 0.8 }} onClick={() => setShowAllComments(true)}>
          <MessageCircle className="w-6 h-6 text-neutral-800" />
        </motion.button>
      </div>

      {/* Like count */}
      {post.likeCount > 0 && (
        <p className="px-4 text-[13px] font-semibold text-neutral-900">
          좋아요 {post.likeCount}개
        </p>
      )}

      {/* Caption */}
      {post.caption && (
        <p className="px-4 text-[13px] text-neutral-800 leading-relaxed mt-0.5">
          <span className="font-semibold mr-1.5">{post.userName}</span>
          {post.caption}
        </p>
      )}

      {/* Comments preview */}
      {post.comments && post.comments.length > 2 && !showAllComments && (
        <button onClick={() => setShowAllComments(true)} className="px-4 mt-1">
          <span className="text-neutral-400 text-[13px]">
            댓글 {post.comments.length}개 모두 보기
          </span>
        </button>
      )}

      {visibleComments.length > 0 && (
        <div className="px-4 mt-1 space-y-0.5">
          {visibleComments.map((c) => (
            <p key={c.id} className="text-[13px] text-neutral-800">
              <span className="font-semibold mr-1.5">{c.userName}</span>
              {c.text}
            </p>
          ))}
        </div>
      )}

      {/* Date */}
      <p className="px-4 text-neutral-300 text-[11px] mt-1.5 mb-2">
        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
      </p>

      {/* Comment input */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-neutral-50">
        <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <span className="text-neutral-500 text-[9px] font-bold">
            {currentUser?.name?.charAt(0) || '?'}
          </span>
        </div>
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmitComment()
          }}
          placeholder="댓글 달기..."
          className="flex-1 bg-transparent text-[13px] text-neutral-800 placeholder:text-neutral-300 outline-none"
        />
        {commentText.trim() && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleSubmitComment}
          >
            <Send className="w-4.5 h-4.5 text-primary-500" />
          </motion.button>
        )}
      </div>
    </article>
  )
}

/* ───────── Feed Scroll View (full-screen, scrollable) ───────── */
export default function FeedScrollView({
  posts,
  startPostId,
  onClose,
}: {
  posts: FeedPost[]
  startPostId: string
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const postRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Scroll to tapped post on mount
  useEffect(() => {
    const el = postRefs.current.get(startPostId)
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' })
    }
  }, [startPostId])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-neutral-100">
        <div className="flex items-center justify-between px-4 pt-[max(8px,env(safe-area-inset-top))] pb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center active:bg-neutral-100"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-800" />
          </button>
          <h2 className="text-[16px] font-bold text-neutral-900">게시물</h2>
          <div className="w-8" />
        </div>
      </div>

      {/* Scrollable feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-[max(20px,env(safe-area-inset-bottom))]"
      >
        {posts.map((post) => (
          <div
            key={post.id}
            ref={(el) => {
              if (el) postRefs.current.set(post.id, el)
            }}
          >
            <FeedItem postId={post.id} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
