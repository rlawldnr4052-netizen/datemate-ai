'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Info, Lightbulb, MapPin, Clock, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/stores/useChatStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import TopBar from '@/components/ui/TopBar'
import PageTransition from '@/components/motion/PageTransition'
import { CourseRecommendation } from '@/types/chat'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-neutral-400"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function CourseCard({ course }: { course: CourseRecommendation }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-200/50 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary-500" />
          <span className="text-caption font-semibold text-primary-600">{course.region}</span>
          <span className="text-neutral-300">·</span>
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-caption text-neutral-500">{Math.floor(course.estimatedDuration / 60)}시간</span>
        </div>
        <h4 className="text-body-1 font-bold text-neutral-900 mb-1">{course.title}</h4>
        <p className="text-caption text-neutral-500 mb-3">{course.description}</p>

        <div className="flex flex-col gap-1.5">
          {course.places.map((place, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <span className="text-caption font-medium text-neutral-800">{place.name}</span>
                <span className="text-[10px] text-neutral-400 ml-1.5">{place.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => router.push('/course/generate')}
        className="w-full flex items-center justify-center gap-1 py-3 bg-primary-500 text-white text-caption font-semibold hover:bg-primary-600 transition-colors"
      >
        이 코스로 시작하기 <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export default function ChatPage() {
  const { messages, isTyping, isTMIEnabled, quickReplies, sendMessage, toggleTMI } = useChatStore()
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe } = useOnboardingStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const userProfile = useMemo(() => ({
    dateType,
    likedTags,
    dislikedTags,
    mbti,
    birthday,
    location,
    selectedVibe,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim() || isTyping) return
    sendMessage(input.trim(), userProfile)
    setInput('')
  }

  const handleQuickReply = (label: string) => {
    if (isTyping) return
    sendMessage(label, userProfile)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <PageTransition className="h-screen flex flex-col bg-neutral-50">
      <TopBar
        title="AI 메이트"
        showBack={false}
        rightAction={
          <button
            onClick={toggleTMI}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-caption font-medium transition-colors ${
              isTMIEnabled
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-500'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            TMI
          </button>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-40">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">AI</span>
                    </div>
                    <span className="text-caption text-neutral-400">데이트메이트</span>
                  </div>
                )}

                <div className={`
                  px-4 py-3 rounded-2xl text-body-2 whitespace-pre-wrap leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-primary-500 text-white rounded-br-md'
                    : 'bg-white text-neutral-800 shadow-sm rounded-bl-md'
                  }
                `}>
                  {msg.content}
                </div>

                {/* Course Recommendation Card */}
                {msg.courseRecommendation && (
                  <CourseCard course={msg.courseRecommendation} />
                )}

                {/* TMI Card */}
                {msg.tmiData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 bg-accent-100 rounded-2xl border border-accent-300/30"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-accent-500" />
                      <span className="text-caption font-semibold text-accent-500">
                        {msg.tmiData.title}
                      </span>
                    </div>
                    <p className="text-caption text-neutral-600">
                      {msg.tmiData.content}
                    </p>
                  </motion.div>
                )}

                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">AI</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm rounded-bl-md">
                <TypingIndicator />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-neutral-100 safe-bottom">
        {/* Quick Replies */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3">
          {quickReplies.map((qr) => (
            <motion.button
              key={qr.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickReply(qr.label)}
              disabled={isTyping}
              className="flex-shrink-0 px-4 py-2 bg-primary-50 text-primary-500 rounded-pill text-caption font-medium hover:bg-primary-100 transition-colors disabled:opacity-50"
            >
              {qr.label}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 pb-4">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            disabled={isTyping}
            className="flex-1 h-11 px-4 bg-neutral-100 rounded-pill text-body-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className={`
              w-11 h-11 rounded-full flex items-center justify-center transition-colors
              ${input.trim() && !isTyping
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-neutral-200 text-neutral-400'
              }
            `}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
