'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Info, Lightbulb } from 'lucide-react'
import { useChatStore } from '@/stores/useChatStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { getPersona } from '@/data/aiPersona'
import TopBar from '@/components/ui/TopBar'
import PageTransition from '@/components/motion/PageTransition'
import CourseTimelineCard, { CourseTimelineSkeleton } from '@/components/chat/CourseTimelineCard'

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
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

export default function ChatPage() {
  const { messages, isTyping, isTMIEnabled, quickReplies, sendMessage, toggleTMI, syncPersona } =
    useChatStore()
  const {
    dateType,
    likedTags,
    dislikedTags,
    mbti,
    birthday,
    location,
    selectedVibe,
    selectedBudget,
  } = useOnboardingStore()
  const [input, setInput] = useState('')
  const [geoLocation, setGeoLocation] = useState<{ lat: number; lng: number } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const persona = useMemo(() => getPersona(dateType), [dateType])

  // Sync persona when dateType changes
  useEffect(() => {
    syncPersona(dateType)
  }, [dateType, syncPersona])

  // 브라우저 Geolocation API로 정확한 위치 가져오기
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  const userProfile = useMemo(
    () => ({
      dateType,
      likedTags,
      dislikedTags,
      mbti,
      birthday,
      location,
      selectedVibe,
      selectedBudget,
      geoLocation,
    }),
    [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget, geoLocation],
  )

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
    <PageTransition className="h-screen flex flex-col" style={{ backgroundColor: persona.bgTint }}>
      <TopBar
        title={persona.name}
        showBack={false}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTMI}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-pill text-caption font-medium transition-colors ${
                isTMIEnabled
                  ? 'text-white'
                  : 'bg-neutral-100 text-neutral-500'
              }`}
              style={isTMIEnabled ? { backgroundColor: persona.accentColor } : undefined}
            >
              <Info className="w-3.5 h-3.5" />
              TMI
            </button>
          </div>
        }
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-44">
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
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${persona.gradientFrom}, ${persona.gradientTo})`,
                      }}
                    >
                      <span className="text-white text-[10px] font-bold">AI</span>
                    </div>
                    <span className="text-caption text-neutral-400">{persona.name}</span>
                  </div>
                )}

                {/* Text bubble */}
                {msg.content.trim() && (
                  <div
                    className={`px-4 py-3 rounded-2xl text-body-2 whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-md'
                        : 'bg-white text-neutral-800 shadow-sm rounded-bl-md'
                    }`}
                    style={
                      msg.role === 'user'
                        ? { background: persona.userBubbleBg }
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                )}

                {/* Course timeline card */}
                {msg.courseRecommendation && (
                  <CourseTimelineCard
                    course={msg.courseRecommendation}
                    generatedCourseId={msg.generatedCourseId}
                    isGenerating={msg.isGeneratingCourse}
                  />
                )}
                {/* 코스 생성 중이지만 추천 데이터 없을 때 스켈레톤 */}
                {msg.isGeneratingCourse && !msg.courseRecommendation && (
                  <CourseTimelineSkeleton />
                )}

                {/* TMI Card */}
                {msg.tmiData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-3 rounded-2xl border"
                    style={{
                      backgroundColor: `${persona.accentColor}10`,
                      borderColor: `${persona.accentColor}30`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4" style={{ color: persona.accentColor }} />
                      <span
                        className="text-caption font-semibold"
                        style={{ color: persona.accentColor }}
                      >
                        {msg.tmiData.title}
                      </span>
                    </div>
                    <p className="text-caption text-neutral-600">{msg.tmiData.content}</p>
                  </motion.div>
                )}

                <span className="text-[10px] text-neutral-400 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${persona.gradientFrom}, ${persona.gradientTo})`,
                }}
              >
                <span className="text-white text-[10px] font-bold">AI</span>
              </div>
              <div className="bg-white rounded-2xl shadow-sm rounded-bl-md">
                <TypingIndicator color={persona.accentColor} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-neutral-100">
        {/* Quick Replies */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-2">
          {quickReplies.map((qr) => (
            <motion.button
              key={qr.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickReply(qr.label)}
              disabled={isTyping}
              className="flex-shrink-0 px-4 py-2 rounded-pill text-caption font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: `${persona.accentColor}12`,
                color: persona.accentColor,
              }}
            >
              {qr.label}
            </motion.button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3 px-5 pb-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요"
            disabled={isTyping}
            className="flex-1 h-11 px-4 bg-neutral-100 rounded-pill text-body-2 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50"
            style={
              { '--tw-ring-color': `${persona.accentColor}60` } as React.CSSProperties
            }
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-colors"
            style={
              input.trim() && !isTyping
                ? {
                    background: `linear-gradient(135deg, ${persona.gradientFrom}, ${persona.gradientTo})`,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${persona.accentColor}40`,
                  }
                : { backgroundColor: '#e5e5e5', color: '#a3a3a3' }
            }
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </PageTransition>
  )
}
