'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Heart,
  MessageCircle,
  MapPin,
  ChevronRight,
  Navigation,
  Send,
} from 'lucide-react'
import { FeedPost } from '@/types/feed'
import { useFeedStore } from '@/stores/useFeedStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useRouter } from 'next/navigation'

export default function PostViewer({
  post,
  onClose,
}: {
  post: FeedPost
  onClose: () => void
}) {
  const router = useRouter()
  const { toggleLike, addComment } = useFeedStore()
  const { currentUser } = useAuthStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [likeAnim, setLikeAnim] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const commentInputRef = useRef<HTMLInputElement>(null)

  // photos + last course info slide
  const totalSlides = post.photos.length + 1
  // Get fresh post data from store
  const freshPost = useFeedStore((s) => s.posts.find((p) => p.id === post.id)) || post

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      touchEndX.current = e.changedTouches[0].clientX
      const diff = touchStartX.current - touchEndX.current
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < totalSlides - 1) {
          setCurrentIndex((i) => i + 1)
        } else if (diff < 0 && currentIndex > 0) {
          setCurrentIndex((i) => i - 1)
        }
      }
    },
    [currentIndex, totalSlides],
  )

  const handleDoubleTap = () => {
    if (!freshPost.isLiked) {
      toggleLike(post.id)
      setLikeAnim(true)
      setTimeout(() => setLikeAnim(false), 800)
    }
  }

  const goToCourse = () => {
    onClose()
    router.push(`/course/${post.courseId}`)
  }

  const openNaverMap = (placeName: string) => {
    const encoded = encodeURIComponent(placeName)
    window.open(`https://map.naver.com/v5/search/${encoded}`, '_blank')
  }

  const handleSubmitComment = () => {
    if (!commentText.trim() || !currentUser) return
    addComment(post.id, currentUser.id, currentUser.name, commentText.trim())
    setCommentText('')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
            <span className="text-white text-[12px] font-bold">
              {post.userName.charAt(0)}
            </span>
          </div>
          <span className="text-white text-[14px] font-semibold">{post.userName}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Carousel - Instagram 4:5 ratio */}
      <div className="relative px-0">
        <div
          className="relative overflow-hidden"
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
            {/* Photo slides */}
            {post.photos.map((photo) => (
              <div key={photo.id} className="flex-shrink-0 min-w-full h-full relative">
                <div
                  className="w-full h-full bg-cover bg-center bg-neutral-900"
                  style={{ backgroundImage: `url(${photo.imageUrl})` }}
                />
                {/* Place tag - bottom left, clickable to Naver Maps */}
                {photo.placeName && (
                  <button
                    onClick={() => openNaverMap(photo.placeName)}
                    className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 active:scale-95 transition-transform"
                  >
                    <MapPin className="w-3 h-3 text-white" />
                    <span className="text-white text-[12px] font-medium">
                      {photo.placeName}
                    </span>
                  </button>
                )}
              </div>
            ))}

            {/* Last slide: Course info */}
            <div className="flex-shrink-0 min-w-full h-full flex items-center justify-center p-8 bg-neutral-950">
              <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center mx-auto mb-4">
                    <Navigation className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-white text-[22px] font-bold mb-2">
                    {post.courseTitle}
                  </h2>
                  <p className="text-white/50 text-[14px]">
                    {post.courseRegion} · {post.photos.length}곳
                  </p>
                </div>

                {/* Place list */}
                <div className="space-y-2 mb-8">
                  {post.photos.filter((p) => p.placeName).map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => openNaverMap(photo.placeName)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 active:bg-white/15 transition-colors text-left"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-white text-[13px] font-medium flex-1">
                        {photo.placeName}
                      </span>
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={goToCourse}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 text-white font-bold text-[15px] flex items-center justify-center gap-2"
                >
                  이 코스 따라하기
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Double-tap like animation */}
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

          {/* Slide indicators */}
          <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div
                key={i}
                className={`h-[3px] rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section - scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Actions row */}
        <div className="px-4 pt-3 pb-1 flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleLike(post.id)}
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                freshPost.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
              }`}
            />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              setShowComments(true)
              setTimeout(() => commentInputRef.current?.focus(), 100)
            }}
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Like count */}
        {freshPost.likeCount > 0 && (
          <p className="px-4 text-white text-[13px] font-semibold">
            좋아요 {freshPost.likeCount}개
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="px-4 text-white text-[13px] leading-relaxed mt-1">
            <span className="font-semibold mr-1.5">{post.userName}</span>
            {post.caption}
          </p>
        )}

        {/* Comment count / preview */}
        {freshPost.comments && freshPost.comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="px-4 mt-1 text-left"
          >
            <span className="text-white/40 text-[13px]">
              댓글 {freshPost.comments.length}개 모두 보기
            </span>
          </button>
        )}

        {/* Date */}
        <p className="px-4 text-white/30 text-[11px] mt-1">
          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
        </p>

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col min-h-0 mt-2"
            >
              {/* Comments header */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/10">
                <span className="text-white text-[14px] font-semibold">
                  댓글 {freshPost.comments?.length || 0}
                </span>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-white/40 text-[12px]"
                >
                  접기
                </button>
              </div>

              {/* Comment list */}
              <div className="flex-1 overflow-y-auto px-4 space-y-3 min-h-0" style={{ maxHeight: '150px' }}>
                {freshPost.comments && freshPost.comments.length > 0 ? (
                  freshPost.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-[10px] font-bold">
                          {comment.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[13px]">
                          <span className="font-semibold mr-1.5">{comment.userName}</span>
                          {comment.text}
                        </p>
                        <p className="text-white/30 text-[10px] mt-0.5">
                          {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/30 text-[13px] text-center py-4">
                    아직 댓글이 없어요
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment input - always visible at bottom */}
        <div className="px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">
                {currentUser?.name?.charAt(0) || '?'}
              </span>
            </div>
            <input
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitComment()
              }}
              placeholder="댓글 달기..."
              className="flex-1 bg-transparent text-white text-[13px] placeholder:text-white/30 outline-none"
            />
            {commentText.trim() && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={handleSubmitComment}
              >
                <Send className="w-5 h-5 text-primary-400" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
