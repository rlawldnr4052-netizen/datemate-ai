'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { MBTIType, Vibe, BudgetLevel } from '@/types/onboarding'
import { preferenceTags, vibeOptions, budgetOptions } from '@/data/tags'
import { mbtiOptions } from '@/data/mbti'
import { cities, districtsByCity } from '@/data/regions'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

const categoryLabels: Record<string, string> = {
  vibe: '분위기', place: '장소', food: '음식', activity: '활동', style: '스타일', time: '시간대',
}

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 51 }, (_, i) => currentYear - 10 - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const days = Array.from({ length: 31 }, (_, i) => i + 1)

export default function OnboardingPage() {
  const router = useRouter()
  const store = useOnboardingStore()

  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(store.mbti)
  const [birthYear, setBirthYear] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [city, setCity] = useState(store.location?.city || '')
  const [district, setDistrict] = useState(store.location?.district || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(store.likedTags)
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(store.selectedVibe)
  const [selectedBudget, setSelectedBudget] = useState<BudgetLevel | null>(store.selectedBudget)

  const districts = city ? districtsByCity[city] || [] : []

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
  }

  const isValid = selectedTags.length >= 3 && selectedVibe && selectedBudget

  const handleComplete = () => {
    if (!isValid) return
    store.setDateType('couple')
    if (selectedMBTI) store.setMBTI(selectedMBTI)
    if (birthYear && birthMonth && birthDay) {
      store.setBirthday(`${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`)
    }
    if (city && district) store.setLocation({ city, district })
    store.setLikedTags(selectedTags)
    store.setVibe(selectedVibe)
    store.setBudget(selectedBudget)
    router.push('/complete')
  }

  const tagsByCategory = preferenceTags.reduce<Record<string, typeof preferenceTags>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  const selectClass = 'w-full appearance-none px-3 py-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm text-neutral-900 outline-none focus:border-white/[0.15] transition-all'

  return (
    <PageTransition className="min-h-screen flex flex-col bg-white">
      <TopBar title="취향 설정" showBack onBack={() => router.back()} />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        {/* ── 1. 내 정보 (선택) ── */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">나에 대해 알려주세요</h2>
          <p className="text-caption text-neutral-400 mb-4">선택사항이에요. 넘겨도 괜찮아요!</p>

          {/* MBTI */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-500 mb-2">MBTI</p>
            <div className="grid grid-cols-4 gap-2">
              {mbtiOptions.map((opt) => {
                const active = selectedMBTI === opt.type
                return (
                  <motion.button
                    key={opt.type}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setSelectedMBTI(active ? null : opt.type)}
                    className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-2 transition-all text-xs ${
                      active
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-white/[0.08] bg-white/[0.04]'
                    }`}
                  >
                    {opt.emoji && <span className="text-base">{opt.emoji}</span>}
                    <span className={`font-bold ${active ? 'text-primary-600' : 'text-neutral-800'}`}>{opt.type}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* 생년월일 */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-neutral-500 mb-2">생년월일</p>
            <div className="flex gap-2">
              <div className="flex-[2] relative">
                <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className={selectClass}>
                  <option value="">년도</option>
                  {years.map((y) => <option key={y} value={y}>{y}년</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className={selectClass}>
                  <option value="">월</option>
                  {months.map((m) => <option key={m} value={m}>{m}월</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              <div className="flex-1 relative">
                <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className={selectClass}>
                  <option value="">일</option>
                  {days.map((d) => <option key={d} value={d}>{d}일</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 지역 */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 mb-2">지역</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <select
                  value={city}
                  onChange={(e) => { setCity(e.target.value); setDistrict('') }}
                  className={selectClass}
                >
                  <option value="">시/도</option>
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
              {city && (
                <div className="flex-1 relative">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">시/군/구</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. 취향 태그 (필수) ── */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">관심 키워드</h2>
          <p className="text-caption text-neutral-400 mb-4">3개 이상 선택해주세요 (현재 {selectedTags.length}개)</p>

          {Object.entries(tagsByCategory).map(([category, tags]) => (
            <div key={category} className="mb-4">
              <p className="text-xs font-semibold text-neutral-500 mb-2">{categoryLabels[category]}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id)
                  return (
                    <motion.button
                      key={tag.id}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => toggleTag(tag.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                        active
                          ? 'bg-primary-500 text-white shadow-sm glow-sm'
                          : 'glass-pill text-neutral-400'
                      }`}
                    >
                      {tag.emoji && <span className="text-base">{tag.emoji}</span>}
                      {tag.label}
                      {active && <Check className="w-3.5 h-3.5" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ── 3. 무드 (필수) ── */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">원하는 무드</h2>
          <p className="text-caption text-neutral-400 mb-4">하나를 선택해주세요</p>
          <div className="grid grid-cols-3 gap-2.5">
            {vibeOptions.map((vibe) => {
              const active = selectedVibe === vibe.id
              return (
                <motion.button
                  key={vibe.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`relative rounded-2xl overflow-hidden transition-all ${
                    active ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-[#0B0B12]' : ''
                  }`}
                >
                  <div className="py-5 px-2 flex flex-col items-center gap-1.5" style={{ background: vibe.gradient }}>
                    {vibe.emoji && <span className="text-2xl">{vibe.emoji}</span>}
                    <span className="text-white font-bold text-sm">{vibe.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* ── 4. 예산 (필수) ── */}
        <section className="mb-4">
          <h2 className="text-title-2 text-neutral-900 mb-1">예산</h2>
          <p className="text-caption text-neutral-400 mb-4">1인 기준</p>
          <div className="flex gap-2.5">
            {budgetOptions.map((opt) => {
              const active = selectedBudget === opt.id
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedBudget(opt.id)}
                  className={`flex-1 rounded-2xl overflow-hidden transition-all ${
                    active ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-[#0B0B12]' : ''
                  }`}
                >
                  <div className="py-4 px-2 flex flex-col items-center gap-1" style={{ background: opt.gradient }}>
                    {opt.emoji && <span className="text-xl">{opt.emoji}</span>}
                    <span className="text-white font-bold text-sm">{opt.label}</span>
                    <span className="text-white/80 text-xs">{opt.range}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>
      </div>

      {/* ── 하단 고정 버튼 ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-app px-5 pb-6 pt-3 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12] to-transparent">
          <Button fullWidth size="lg" disabled={!isValid} onClick={handleComplete}>
            {isValid ? '시작하기' : `조금만 더! (${[selectedTags.length < 3 && '키워드 3개+', !selectedVibe && '무드', !selectedBudget && '예산'].filter(Boolean).join(', ')})`}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
