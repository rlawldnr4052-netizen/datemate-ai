'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, MapPin, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { districtsByCity } from '@/data/regions'
import TopBar from '@/components/ui/TopBar'
import PageTransition from '@/components/motion/PageTransition'

const vibes = [
  { id: 'romantic', label: '로맨틱', emoji: '', gradient: 'linear-gradient(135deg, #fb7185, #f9a8d4)' },
  { id: 'hip', label: '힙/트렌디', emoji: '', gradient: 'linear-gradient(135deg, #f97316, #fbbf24)' },
  { id: 'chill', label: '편안/힐링', emoji: '', gradient: 'linear-gradient(135deg, #34d399, #6ee7b7)' },
  { id: 'adventure', label: '모험/액티브', emoji: '', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
  { id: 'emotional', label: '감성/예술', emoji: '', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { id: 'foodie', label: '미식/맛집', emoji: '', gradient: 'linear-gradient(135deg, #ef4444, #f87171)' },
]

const popularDistricts = ['강남구', '마포구', '성동구', '종로구', '용산구', '송파구', '서초구', '중구']

type Step = 'region' | 'vibe' | 'generating' | 'done'

export default function CourseGeneratePage() {
  const router = useRouter()
  const { dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget } = useOnboardingStore()
  const { generateCourse, activeCourseId } = useCourseStore()

  const [step, setStep] = useState<Step>('region')
  const [selectedRegion, setSelectedRegion] = useState<string>(location?.district || '')
  const [selectedVibeId, setSelectedVibeId] = useState<string>(selectedVibe || '')
  const [error, setError] = useState<string | null>(null)

  const userProfile = useMemo(() => ({
    dateType,
    likedTags,
    dislikedTags,
    mbti,
    birthday,
    location,
    selectedVibe,
    selectedBudget,
  }), [dateType, likedTags, dislikedTags, mbti, birthday, location, selectedVibe, selectedBudget])

  const districts = useMemo(() => {
    const city = location?.city || '서울특별시'
    return districtsByCity[city] || districtsByCity['서울특별시']
  }, [location])

  const handleGenerate = async () => {
    if (!selectedRegion) return
    setStep('generating')
    setError(null)

    const course = await generateCourse({
      userProfile,
      region: selectedRegion,
      dateType: dateType || 'couple',
      vibe: selectedVibeId || selectedVibe || 'romantic',
      budget: selectedBudget || undefined,
    })

    if (course) {
      setStep('done')
    } else {
      setError('코스 생성에 실패했어요. 다시 시도해주세요!')
      setStep('vibe')
    }
  }

  const handleViewCourse = () => {
    if (activeCourseId) {
      router.push(`/course/${activeCourseId}`)
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col bg-[#0B0B12]">
      <TopBar title="AI 코스 만들기" />

      <div className="flex-1 px-5 pt-6 pb-8 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Step 1: Region Selection */}
          {step === 'region' && (
            <motion.div
              key="region"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-title-1 text-neutral-900 mb-1">어디로 가볼까?</h2>
                <p className="text-body-2 text-neutral-500">코스를 만들 지역을 선택해주세요</p>
              </div>

              {/* Popular districts */}
              <div className="mb-4">
                <p className="text-caption font-medium text-neutral-400 mb-2">인기 지역</p>
                <div className="flex gap-2 flex-wrap">
                  {popularDistricts.map((d) => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRegion(d)}
                      className={`px-4 py-2.5 rounded-2xl text-body-2 font-medium transition-all ${
                        selectedRegion === d
                          ? 'bg-primary-500 text-white shadow-md glow-sm'
                          : 'glass-pill text-neutral-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 inline mr-1" />
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* All districts */}
              <div className="mb-6">
                <p className="text-caption font-medium text-neutral-400 mb-2">전체 지역</p>
                <div className="flex gap-2 flex-wrap max-h-[200px] overflow-y-auto">
                  {districts.filter((d) => !popularDistricts.includes(d)).map((d) => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRegion(d)}
                      className={`px-3 py-2 rounded-xl text-caption font-medium transition-all ${
                        selectedRegion === d
                          ? 'bg-primary-500 text-white glow-sm'
                          : 'glass-pill text-neutral-500'
                      }`}
                    >
                      {d}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="mt-auto">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('vibe')}
                  disabled={!selectedRegion}
                  className={`w-full py-4 rounded-2xl text-body-1 font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedRegion
                      ? 'bg-primary-500 text-white shadow-lg glow-md'
                      : 'bg-white/[0.06] text-neutral-400'
                  }`}
                >
                  다음 <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Vibe Selection */}
          {step === 'vibe' && (
            <motion.div
              key="vibe"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col"
            >
              <div className="mb-6">
                <h2 className="text-title-1 text-neutral-900 mb-1">어떤 분위기가 좋아?</h2>
                <p className="text-body-2 text-neutral-500">
                  {selectedRegion}에서의 분위기를 선택해주세요
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-caption">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                {vibes.map((v) => (
                  <motion.button
                    key={v.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedVibeId(v.id)}
                    className={`relative rounded-2xl overflow-hidden transition-all ${
                      selectedVibeId === v.id
                        ? 'ring-3 ring-primary-400 ring-offset-2 ring-offset-[#0B0B12] shadow-lg'
                        : 'shadow-card'
                    }`}
                  >
                    <div
                      className="p-5 flex flex-col items-center gap-2"
                      style={{ background: v.gradient }}
                    >
                      {v.emoji && <span className="text-3xl">{v.emoji}</span>}
                      <span className="text-white font-bold text-body-2">{v.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => setStep('region')}
                  className="flex-1 py-4 rounded-2xl text-body-1 font-bold bg-white/[0.06] text-neutral-400"
                >
                  이전
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerate}
                  disabled={!selectedVibeId}
                  className={`flex-[2] py-4 rounded-2xl text-body-1 font-bold flex items-center justify-center gap-2 transition-all ${
                    selectedVibeId
                      ? 'bg-primary-500 text-white shadow-lg glow-md'
                      : 'bg-white/[0.06] text-neutral-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  AI 코스 만들기
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Generating */}
          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center mb-6"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-title-1 text-neutral-900 mb-2">AI가 코스를 만들고 있어요</h2>
              <p className="text-body-2 text-neutral-500 text-center">
                {selectedRegion}에서 {vibes.find((v) => v.id === selectedVibeId)?.label} 분위기의
                <br />완벽한 코스를 찾고 있어요...
              </p>

              <div className="mt-8 flex flex-col gap-3 w-full max-w-[280px]">
                {['카카오에서 장소 검색 중...', '관광공사 데이터 분석 중...', 'AI가 최적 코스 구성 중...'].map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 1.5 }}
                    className="flex items-center gap-3"
                  >
                    <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                    <span className="text-caption text-neutral-500">{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-title-1 text-neutral-900 mb-2">코스가 완성됐어!</h2>
              <p className="text-body-2 text-neutral-500 text-center mb-8">
                {selectedRegion}에서의 특별한 하루가 준비됐어요
              </p>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleViewCourse}
                className="w-full max-w-[280px] py-4 rounded-2xl bg-primary-500 text-white text-body-1 font-bold shadow-lg flex items-center justify-center gap-2"
              >
                코스 보러가기 <ArrowRight className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => {
                  setStep('region')
                  setSelectedRegion('')
                  setSelectedVibeId('')
                }}
                className="mt-3 py-3 text-body-2 text-neutral-400"
              >
                다른 코스 만들기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
