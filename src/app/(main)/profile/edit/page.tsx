'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, User, Users, Check, ChevronDown } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { DateType, MBTIType, Vibe, BudgetLevel } from '@/types/onboarding'
import { preferenceTags, vibeOptions, budgetOptions } from '@/data/tags'
import { mbtiOptions } from '@/data/mbti'
import { cities, districtsByCity } from '@/data/regions'
import TopBar from '@/components/ui/TopBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

const typeOptions: { type: DateType; label: string; icon: typeof Heart; gradient: string }[] = [
  { type: 'couple', label: '연인과', icon: Heart, gradient: 'from-rose-400 to-pink-400' },
  { type: 'solo', label: '나혼자', icon: User, gradient: 'from-violet-400 to-purple-400' },
  { type: 'friends', label: '친구와', icon: Users, gradient: 'from-amber-400 to-orange-400' },
]

const categoryLabels: Record<string, string> = {
  vibe: '분위기', place: '장소', food: '음식', activity: '활동', style: '스타일', time: '시간대',
}

export default function ProfileEditPage() {
  const router = useRouter()
  const store = useOnboardingStore()

  const [dateType, setDateType] = useState<DateType | null>(store.dateType)
  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(store.mbti)
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

  const isValid = dateType && selectedTags.length >= 3 && selectedVibe && selectedBudget

  const handleSave = () => {
    if (!isValid) return
    store.setDateType(dateType)
    if (selectedMBTI) store.setMBTI(selectedMBTI)
    if (city && district) store.setLocation({ city, district })
    store.setLikedTags(selectedTags)
    store.setVibe(selectedVibe)
    store.setBudget(selectedBudget)
    router.back()
  }

  const tagsByCategory = preferenceTags.reduce<Record<string, typeof preferenceTags>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = []
    acc[tag.category].push(tag)
    return acc
  }, {})

  return (
    <PageTransition className="min-h-screen flex flex-col bg-white">
      <TopBar title="프로필 편집" showBack />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        {/* 1. 데이트 타입 */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">누구와 함께하나요?</h2>
          <p className="text-caption text-neutral-400 mb-4">하나를 선택해주세요</p>
          <div className="flex gap-3">
            {typeOptions.map((opt) => {
              const Icon = opt.icon
              const active = dateType === opt.type
              return (
                <motion.button
                  key={opt.type}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDateType(opt.type)}
                  className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                    active
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${opt.gradient}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-sm font-semibold ${active ? 'text-primary-600' : 'text-neutral-700'}`}>
                    {opt.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* 2. MBTI */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">MBTI <span className="text-caption text-neutral-400 font-normal">(선택)</span></h2>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {mbtiOptions.map((opt) => {
              const active = selectedMBTI === opt.type
              return (
                <motion.button
                  key={opt.type}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedMBTI(active ? null : opt.type)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border-2 transition-all text-xs ${
                    active
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-100 bg-white'
                  }`}
                >
                  <span className="text-base">{opt.emoji}</span>
                  <span className={`font-bold ${active ? 'text-primary-600' : 'text-neutral-800'}`}>{opt.type}</span>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* 3. 지역 */}
        <section className="mb-8">
          <h2 className="text-title-2 text-neutral-900 mb-1">지역 <span className="text-caption text-neutral-400 font-normal">(선택)</span></h2>
          <div className="flex gap-3 mt-3">
            <div className="flex-1 relative">
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setDistrict('') }}
                className="w-full appearance-none px-3 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-primary-400 transition-all"
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
                  className="w-full appearance-none px-3 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 outline-none focus:border-primary-400 transition-all"
                >
                  <option value="">시/군/구</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            )}
          </div>
        </section>

        {/* 4. 취향 태그 */}
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
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      <span className="text-base">{tag.emoji}</span>
                      {tag.label}
                      {active && <Check className="w-3.5 h-3.5" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>

        {/* 5. 무드 */}
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
                    active ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  }`}
                >
                  <div className="py-5 px-2 flex flex-col items-center gap-1.5" style={{ background: vibe.gradient }}>
                    <span className="text-2xl">{vibe.emoji}</span>
                    <span className="text-white font-bold text-sm">{vibe.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>

        {/* 6. 예산 */}
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
                    active ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  }`}
                >
                  <div className="py-4 px-2 flex flex-col items-center gap-1" style={{ background: opt.gradient }}>
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="text-white font-bold text-sm">{opt.label}</span>
                    <span className="text-white/80 text-xs">{opt.range}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </section>
      </div>

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-app px-5 pb-6 pt-3 bg-gradient-to-t from-white via-white to-white/0">
          <Button fullWidth size="lg" disabled={!isValid} onClick={handleSave}>
            {isValid ? '저장하기' : `조금만 더! (${[!dateType && '타입', selectedTags.length < 3 && '키워드 3개+', !selectedVibe && '무드', !selectedBudget && '예산'].filter(Boolean).join(', ')})`}
          </Button>
        </div>
      </div>
    </PageTransition>
  )
}
