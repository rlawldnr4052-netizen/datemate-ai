'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dices, Train, MapPin, UtensilsCrossed, CreditCard, Coffee,
  Sparkles, ArrowRight, Loader2, Zap, Music, Compass, BookOpen,
  type LucideIcon,
} from 'lucide-react'
import {
  subwayLines, mealTypes, payerOptions, cafeKeywords, activityTypes,
  friendsAreas, friendsMeals, friendsPayers, friendsActivities, friendsPenalties,
  soloVibes, soloMeals, soloCafeTypes, soloActivities,
  getRegionFromStation, areaToRegion,
  type SubwayLine, type GachaOption, type GachaMode,
} from '@/data/gacha'
import { useCourseStore } from '@/stores/useCourseStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import PageTransition from '@/components/motion/PageTransition'

// ── Step definitions per mode ──
interface StepDef {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  color: string
}

const coupleSteps: StepDef[] = [
  { id: 'line', title: '지하철 호선', subtitle: '어떤 노선을 타게 될까?', icon: Train, color: 'rgba(236,72,153,0.8)' },
  { id: 'station', title: '역', subtitle: '어디서 내릴까?', icon: MapPin, color: 'rgba(34,211,153,0.8)' },
  { id: 'meal', title: '식사', subtitle: '뭘 먹을까?', icon: UtensilsCrossed, color: 'rgba(239,68,68,0.8)' },
  { id: 'payer', title: '결제', subtitle: '누가 쏠까?', icon: CreditCard, color: 'rgba(236,72,153,0.8)' },
  { id: 'cafe', title: '카페 키워드', subtitle: '어떤 맛을 찾을까?', icon: Coffee, color: 'rgba(245,158,11,0.8)' },
  { id: 'activity', title: '놀거리', subtitle: '뭐하고 놀까?', icon: Sparkles, color: 'rgba(139,92,246,0.8)' },
]

const friendsSteps: StepDef[] = [
  { id: 'area', title: '동네', subtitle: '어디로 모일까?', icon: MapPin, color: 'rgba(245,166,35,0.8)' },
  { id: 'meal', title: '식사', subtitle: '뭐 먹을까?', icon: UtensilsCrossed, color: 'rgba(239,68,68,0.8)' },
  { id: 'payer', title: '결제', subtitle: '누가 쏠까?', icon: CreditCard, color: 'rgba(78,205,196,0.8)' },
  { id: 'activity', title: '놀거리', subtitle: '뭐하고 놀까?', icon: Zap, color: 'rgba(34,211,153,0.8)' },
  { id: 'penalty', title: '벌칙', subtitle: '오늘의 벌칙은?', icon: Music, color: 'rgba(155,89,182,0.8)' },
]

const soloSteps: StepDef[] = [
  { id: 'line', title: '지하철 호선', subtitle: '어디로 떠날까?', icon: Train, color: 'rgba(167,139,250,0.8)' },
  { id: 'station', title: '역', subtitle: '어디서 내릴까?', icon: MapPin, color: 'rgba(34,211,153,0.8)' },
  { id: 'vibe', title: '분위기', subtitle: '오늘의 무드는?', icon: Compass, color: 'rgba(236,72,153,0.8)' },
  { id: 'meal', title: '혼밥', subtitle: '뭘 먹을까?', icon: UtensilsCrossed, color: 'rgba(239,68,68,0.8)' },
  { id: 'cafe', title: '카페', subtitle: '어떤 카페를 갈까?', icon: Coffee, color: 'rgba(245,158,11,0.8)' },
  { id: 'activity', title: '혼놀', subtitle: '뭐하고 놀까?', icon: BookOpen, color: 'rgba(99,102,241,0.8)' },
]

const modeConfig: Record<GachaMode, {
  title: string
  steps: StepDef[]
  doneGradient: string
  doneGlow: string
  accentColor: string
}> = {
  couple: {
    title: '가챠 데이트',
    steps: coupleSteps,
    doneGradient: 'linear-gradient(135deg, #FF7EB3, #E8457C)',
    doneGlow: 'rgba(232,69,124,0.3)',
    accentColor: '#FF7EB3',
  },
  friends: {
    title: '가챠 놀기',
    steps: friendsSteps,
    doneGradient: 'linear-gradient(135deg, #FFD060, #F5A623)',
    doneGlow: 'rgba(245,166,35,0.3)',
    accentColor: '#FFD060',
  },
  solo: {
    title: '가챠 혼놀',
    steps: soloSteps,
    doneGradient: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    doneGlow: 'rgba(124,58,237,0.3)',
    accentColor: '#A78BFA',
  },
}

const stepIconMap: Record<string, { icon: LucideIcon; label: string }> = {
  line: { icon: Train, label: '호선' },
  station: { icon: MapPin, label: '역' },
  area: { icon: MapPin, label: '동네' },
  meal: { icon: UtensilsCrossed, label: '식사' },
  payer: { icon: CreditCard, label: '결제' },
  cafe: { icon: Coffee, label: '카페' },
  activity: { icon: Sparkles, label: '놀거리' },
  penalty: { icon: Music, label: '벌칙' },
  vibe: { icon: Compass, label: '분위기' },
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function findOpt(arr: GachaOption[], label: string): GachaOption {
  return arr.find(o => o.label === label) || { id: '', label, color: '#888' }
}

export default function GachaPage() {
  const router = useRouter()
  const { generateCourse, setMode } = useCourseStore()
  const dateType = useOnboardingStore((s) => s.dateType)

  const mode: GachaMode = dateType === 'friends' ? 'friends' : dateType === 'solo' ? 'solo' : 'couple'
  const config = modeConfig[mode]
  const steps = config.steps

  const [currentStep, setCurrentStep] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [results, setResults] = useState<Record<string, { label: string; color?: string; raw?: SubwayLine }>>({})
  const [spinDisplay, setSpinDisplay] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const spinInterval = useRef<NodeJS.Timeout | null>(null)

  const isDone = currentStep >= steps.length
  const currentStepDef = !isDone ? steps[currentStep] : null
  const stepColor = currentStepDef?.color || config.accentColor

  // ── Get options ──
  const getOptions = useCallback((): string[] => {
    if (!currentStepDef) return []
    switch (currentStepDef.id) {
      case 'line': return subwayLines.map(l => l.name)
      case 'station': return results.line?.raw?.stations || []
      case 'area': return friendsAreas.map(a => a.label)
      case 'vibe': return soloVibes.map(v => v.label)
      case 'penalty': return friendsPenalties.map(p => p.label)
      case 'meal':
        return mode === 'friends' ? friendsMeals.map(m => m.label)
          : mode === 'solo' ? soloMeals.map(m => m.label)
          : mealTypes.map(m => m.label)
      case 'payer':
        return mode === 'friends' ? friendsPayers.map(p => p.label)
          : payerOptions.map(p => p.label)
      case 'cafe':
        return mode === 'solo' ? soloCafeTypes.map(c => c.label)
          : cafeKeywords.map(c => c.label)
      case 'activity':
        return mode === 'friends' ? friendsActivities.map(a => a.label)
          : mode === 'solo' ? soloActivities.map(a => a.label)
          : activityTypes.map(a => a.label)
      default: return []
    }
  }, [currentStepDef, mode, results.line])

  // ── Spin ──
  const handleSpin = useCallback(() => {
    if (isSpinning || isDone || !currentStepDef) return
    setIsSpinning(true)
    const options = getOptions()
    let count = 0
    const totalSpins = 20 + Math.floor(Math.random() * 10)

    spinInterval.current = setInterval(() => {
      setSpinDisplay(options[count % options.length])
      count++

      if (count >= totalSpins) {
        if (spinInterval.current) clearInterval(spinInterval.current)
        const result = pickRandom(options)
        setSpinDisplay(result)

        setTimeout(() => {
          setIsSpinning(false)
          const stepId = currentStepDef.id

          if (stepId === 'line') {
            const line = subwayLines.find(l => l.name === result)!
            setResults(prev => ({ ...prev, line: { label: result, color: line.color, raw: line } }))
          } else if (stepId === 'station') {
            setResults(prev => ({ ...prev, station: { label: result, color: '#22D3EE' } }))
          } else {
            const sourceMap: Record<string, GachaOption[]> = {
              area: friendsAreas,
              vibe: soloVibes,
              penalty: friendsPenalties,
            }
            const mealSources: Record<string, GachaOption[]> = { friends: friendsMeals, solo: soloMeals }
            const payerSources: Record<string, GachaOption[]> = { friends: friendsPayers }
            const cafeSources: Record<string, GachaOption[]> = { solo: soloCafeTypes }
            const actSources: Record<string, GachaOption[]> = { friends: friendsActivities, solo: soloActivities }

            let source: GachaOption[] | undefined = sourceMap[stepId]
            if (!source) {
              if (stepId === 'meal') source = mealSources[mode] || mealTypes
              else if (stepId === 'payer') source = payerSources[mode] || payerOptions
              else if (stepId === 'cafe') source = cafeSources[mode] || cafeKeywords
              else if (stepId === 'activity') source = actSources[mode] || activityTypes
            }

            if (source) {
              const opt = findOpt(source, result)
              setResults(prev => ({ ...prev, [stepId]: { label: result, color: opt.color } }))
            }
          }

          setTimeout(() => setCurrentStep(prev => prev + 1), 600)
        }, 300)
      }
    }, count > totalSpins * 0.7 ? 150 : 60)
  }, [isSpinning, isDone, currentStepDef, getOptions, mode])

  useEffect(() => {
    return () => { if (spinInterval.current) clearInterval(spinInterval.current) }
  }, [])

  // ── Generate course ──
  const handleGenerate = async () => {
    setIsGenerating(true)
    const region = mode === 'friends'
      ? areaToRegion[results.area?.label || ''] || results.area?.label || '강남구'
      : results.station
        ? getRegionFromStation(results.station.label)
        : '강남구'

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
        vibe: results.vibe?.label || 'adventure',
        gachaContext: {
          station: results.station?.label || results.area?.label || '',
          meal: results.meal?.label || '',
          cafeKeyword: results.cafe?.label || results.vibe?.label || '',
          activity: results.activity?.label || '',
          payer: results.payer?.label || '',
        },
      })

      if (course) router.push(`/course/${course.id}/blind`)
    } catch (e) {
      console.error('Gacha course generation failed:', e)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Tags & done items ──
  const resultTags = steps.filter(s => results[s.id]).map(s => ({ label: results[s.id].label, color: results[s.id].color }))
  const doneItems = steps.filter(s => results[s.id]).map(s => ({
    icon: stepIconMap[s.id]?.icon || Dices,
    label: stepIconMap[s.id]?.label || s.title,
    value: results[s.id].label,
    color: results[s.id].color,
  }))

  return (
    <PageTransition className="min-h-screen bg-[#0B0B12] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-2 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-neutral-400 text-[14px]">취소</button>
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5" style={{ color: config.accentColor }} />
          <span className="text-[16px] font-bold text-white">{config.title}</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="px-5 py-3 flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background: i < currentStep ? stepColor : i === currentStep ? stepColor : 'rgba(255,255,255,0.06)',
              opacity: i <= currentStep ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <AnimatePresence mode="wait">
          {!isDone && currentStepDef ? (
            <motion.div
              key={currentStepDef.id + currentStep}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-[320px] flex flex-col items-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: stepColor, boxShadow: `0 0 30px ${stepColor}` }}
              >
                <currentStepDef.icon className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-[18px] font-bold text-white mb-1">{currentStepDef.title}</h2>
              <p className="text-[13px] text-neutral-500 mb-8">{currentStepDef.subtitle}</p>

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
                  <><Dices className="w-5 h-5" /> 뽑기!</>
                )}
              </motion.button>
            </motion.div>
          ) : (
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
                style={{ background: config.doneGradient, boxShadow: `0 0 40px ${config.doneGlow}` }}
              >
                <Sparkles className="w-9 h-9 text-white" />
              </motion.div>

              <h2 className="text-[20px] font-bold text-white mb-2">뽑기 완료!</h2>
              <p className="text-[13px] text-neutral-500 mb-6">이 조합으로 코스를 만들어볼까?</p>

              <div
                className="w-full rounded-2xl p-5 mb-8 space-y-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {doneItems.map((item, i) => (
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

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 rounded-2xl text-[16px] font-bold text-white flex items-center justify-center gap-2"
                style={{ background: config.doneGradient, boxShadow: `0 4px 20px ${config.doneGlow}` }}
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> 코스 만드는 중...</>
                ) : (
                  <>이 조합으로 코스 만들기 <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>

              <button
                onClick={() => { setCurrentStep(0); setResults({}); setSpinDisplay('') }}
                className="mt-3 text-[13px] text-neutral-600 py-2"
              >
                다시 뽑기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tags */}
      {resultTags.length > 0 && !isDone && (
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
