'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Dices, Train, MapPin, UtensilsCrossed, CreditCard, Coffee, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import {
  subwayLines, mealTypes, payerOptions, cafeKeywords, activityTypes,
  getRegionFromStation,
  type SubwayLine, type GachaOption,
} from '@/data/gacha'
import { useCourseStore } from '@/stores/useCourseStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import PageTransition from '@/components/motion/PageTransition'

type Step = 'line' | 'station' | 'meal' | 'payer' | 'cafe' | 'activity' | 'done'
const STEPS: Step[] = ['line', 'station', 'meal', 'payer', 'cafe', 'activity', 'done']

const stepMeta: Record<Step, { title: string; subtitle: string; icon: typeof Dices }> = {
  line: { title: '지하철 호선', subtitle: '어떤 노선을 타게 될까?', icon: Train },
  station: { title: '역', subtitle: '어디서 내릴까?', icon: MapPin },
  meal: { title: '식사', subtitle: '뭘 먹을까?', icon: UtensilsCrossed },
  payer: { title: '결제', subtitle: '누가 쏠까?', icon: CreditCard },
  cafe: { title: '카페 키워드', subtitle: '어떤 맛을 찾을까?', icon: Coffee },
  activity: { title: '놀거리', subtitle: '뭐하고 놀까?', icon: Sparkles },
  done: { title: '완료', subtitle: '모든 뽑기 완료!', icon: Dices },
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function GachaPage() {
  const router = useRouter()
  const { generateCourse, setMode } = useCourseStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [results, setResults] = useState<{
    line?: SubwayLine
    station?: string
    meal?: GachaOption
    payer?: GachaOption
    cafe?: GachaOption
    activity?: GachaOption
  }>({})
  const [spinDisplay, setSpinDisplay] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const spinInterval = useRef<NodeJS.Timeout | null>(null)

  const step = STEPS[currentStep]
  const meta = stepMeta[step]

  // Get options for current step
  const getOptions = useCallback((): string[] => {
    switch (step) {
      case 'line': return subwayLines.map(l => l.name)
      case 'station': return results.line?.stations || []
      case 'meal': return mealTypes.map(m => m.label)
      case 'payer': return payerOptions.map(p => p.label)
      case 'cafe': return cafeKeywords.map(c => c.label)
      case 'activity': return activityTypes.map(a => a.label)
      default: return []
    }
  }, [step, results.line])

  const handleSpin = useCallback(() => {
    if (isSpinning || step === 'done') return
    setIsSpinning(true)
    const options = getOptions()
    let count = 0
    const totalSpins = 20 + Math.floor(Math.random() * 10)

    spinInterval.current = setInterval(() => {
      setSpinDisplay(options[count % options.length])
      count++

      // Slow down towards end
      if (count >= totalSpins) {
        if (spinInterval.current) clearInterval(spinInterval.current)

        const result = pickRandom(options)
        setSpinDisplay(result)

        // Save result
        setTimeout(() => {
          setIsSpinning(false)
          switch (step) {
            case 'line':
              setResults(prev => ({ ...prev, line: subwayLines.find(l => l.name === result)! }))
              break
            case 'station':
              setResults(prev => ({ ...prev, station: result }))
              break
            case 'meal':
              setResults(prev => ({ ...prev, meal: mealTypes.find(m => m.label === result)! }))
              break
            case 'payer':
              setResults(prev => ({ ...prev, payer: payerOptions.find(p => p.label === result)! }))
              break
            case 'cafe':
              setResults(prev => ({ ...prev, cafe: cafeKeywords.find(c => c.label === result)! }))
              break
            case 'activity':
              setResults(prev => ({ ...prev, activity: activityTypes.find(a => a.label === result)! }))
              break
          }
          setTimeout(() => setCurrentStep(prev => prev + 1), 600)
        }, 300)
      }
    }, count > totalSpins * 0.7 ? 150 : 60)
  }, [isSpinning, step, getOptions])

  useEffect(() => {
    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current)
    }
  }, [])

  const handleGenerate = async () => {
    if (!results.station || !results.meal || !results.activity) return
    setIsGenerating(true)

    const region = getRegionFromStation(results.station)
    const profile = useOnboardingStore.getState()

    try {
      setMode('blind')
      const course = await generateCourse({
        userProfile: {
          dateType: profile.dateType,
          likedTags: profile.likedTags,
          dislikedTags: profile.dislikedTags,
          mbti: profile.mbti,
          birthday: null,
          location: profile.location,
          selectedVibe: profile.selectedVibe,
          selectedBudget: profile.selectedBudget,
        },
        region,
        dateType: profile.dateType || 'couple',
        vibe: 'adventure',
        gachaContext: {
          station: results.station,
          meal: results.meal.label,
          cafeKeyword: results.cafe?.label,
          activity: results.activity.label,
          payer: results.payer?.label,
        },
      })

      if (course) {
        router.push(`/course/${course.id}/blind`)
      }
    } catch (e) {
      console.error('Gacha course generation failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  const stepColor = [
    'rgba(99,102,241,0.8)',   // line
    'rgba(34,211,153,0.8)',   // station
    'rgba(239,68,68,0.8)',    // meal
    'rgba(236,72,153,0.8)',   // payer
    'rgba(245,158,11,0.8)',   // cafe
    'rgba(139,92,246,0.8)',   // activity
    'rgba(6,182,212,0.8)',    // done
  ][currentStep] || 'rgba(99,102,241,0.8)'

  const resultTags = [
    results.line && { label: results.line.name, color: results.line.color },
    results.station && { label: results.station, color: '#22D3EE' },
    results.meal && { label: results.meal.label, color: results.meal.color },
    results.payer && { label: results.payer.label, color: results.payer.color },
    results.cafe && { label: results.cafe.label, color: results.cafe.color },
    results.activity && { label: results.activity.label, color: results.activity.color },
  ].filter(Boolean) as { label: string; color: string | undefined }[]

  return (
    <PageTransition className="min-h-screen bg-[#0B0B12] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-neutral-400 text-[14px]">
          취소
        </button>
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-indigo-400" />
          <span className="text-[16px] font-bold text-white">가챠 데이트</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="px-5 py-3 flex gap-1.5">
        {STEPS.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background: i < currentStep ? stepColor : i === currentStep ? `${stepColor}` : 'rgba(255,255,255,0.06)',
              opacity: i <= currentStep ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {step !== 'done' ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-[320px] flex flex-col items-center"
            >
              {/* Step icon */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: stepColor, boxShadow: `0 0 30px ${stepColor}` }}
              >
                <meta.icon className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-[18px] font-bold text-white mb-1">{meta.title}</h2>
              <p className="text-[13px] text-neutral-500 mb-8">{meta.subtitle}</p>

              {/* Slot machine card */}
              <motion.div
                className="w-full rounded-3xl overflow-hidden mb-8"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isSpinning ? `0 0 40px ${stepColor.replace('0.8', '0.2')}` : 'none',
                }}
              >
                <div className="h-[120px] flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={spinDisplay || 'placeholder'}
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -40, opacity: 0 }}
                      transition={{ duration: isSpinning ? 0.05 : 0.3 }}
                      className="text-[28px] font-black"
                      style={{ color: isSpinning ? 'rgba(255,255,255,0.6)' : 'white' }}
                    >
                      {spinDisplay || '?'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Spin button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full py-4 rounded-2xl text-[16px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: isSpinning
                    ? 'rgba(255,255,255,0.06)'
                    : `linear-gradient(135deg, ${stepColor}, ${stepColor.replace('0.8', '0.6')})`,
                  boxShadow: isSpinning ? 'none' : `0 4px 20px ${stepColor.replace('0.8', '0.3')}`,
                }}
              >
                {isSpinning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Dices className="w-5 h-5" />
                    뽑기!
                  </>
                )}
              </motion.button>
            </motion.div>
          ) : (
            /* Done state */
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[320px] flex flex-col items-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}
              >
                <Sparkles className="w-9 h-9 text-white" />
              </motion.div>

              <h2 className="text-[20px] font-bold text-white mb-2">뽑기 완료!</h2>
              <p className="text-[13px] text-neutral-500 mb-6">이 조합으로 코스를 만들어볼까?</p>

              {/* Result summary */}
              <div
                className="w-full rounded-2xl p-5 mb-8 space-y-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {[
                  { icon: Train, label: '호선', value: results.line?.name, color: results.line?.color },
                  { icon: MapPin, label: '역', value: results.station, color: '#22D3EE' },
                  { icon: UtensilsCrossed, label: '식사', value: results.meal?.label, color: results.meal?.color },
                  { icon: CreditCard, label: '결제', value: results.payer?.label, color: results.payer?.color },
                  { icon: Coffee, label: '카페', value: results.cafe?.label, color: results.cafe?.color },
                  { icon: Sparkles, label: '놀거리', value: results.activity?.label, color: results.activity?.color },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-neutral-600" />
                      <span className="text-[12px] text-neutral-500">{item.label}</span>
                    </div>
                    <span
                      className="text-[14px] font-bold px-3 py-1 rounded-lg"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Generate button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl text-[16px] font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #7C3AED)',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    코스 만드는 중...
                  </>
                ) : (
                  <>
                    이 조합으로 코스 만들기
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              {/* Retry */}
              <button
                onClick={() => {
                  setCurrentStep(0)
                  setResults({})
                  setSpinDisplay('')
                }}
                className="mt-3 text-[13px] text-neutral-600 py-2"
              >
                다시 뽑기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tags */}
      {resultTags.length > 0 && step !== 'done' && (
        <div className="px-5 pb-8 pt-2">
          <div className="flex flex-wrap gap-2 justify-center">
            {resultTags.map((tag, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{ background: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}25` }}
              >
                {tag.label}
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  )
}
