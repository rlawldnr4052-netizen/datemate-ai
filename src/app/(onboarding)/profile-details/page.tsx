'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { MBTIType } from '@/types/onboarding'
import { mbtiOptions } from '@/data/mbti'
import { cities, districtsByCity } from '@/data/regions'
import TopBar from '@/components/ui/TopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function ProfileDetailsPage() {
  const router = useRouter()
  const { mbti, birthday, location, setMBTI, setBirthday, setLocation } = useOnboardingStore()
  const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(mbti)
  const [birthYear, setBirthYear] = useState(birthday ? birthday.split('-')[0] : '')
  const [birthMonth, setBirthMonth] = useState(birthday ? birthday.split('-')[1] : '')
  const [birthDay, setBirthDay] = useState(birthday ? birthday.split('-')[2] : '')
  const [city, setCity] = useState(location?.city || '')
  const [district, setDistrict] = useState(location?.district || '')
  const [step, setStep] = useState<'mbti' | 'info'>('mbti')

  const handleMBTISelect = (type: MBTIType) => {
    setSelectedMBTI(type)
    setMBTI(type)
  }

  const handleNext = () => {
    if (birthYear && birthMonth && birthDay) {
      setBirthday(`${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`)
    }
    if (city && district) {
      setLocation({ city, district })
    }
    router.push('/preferences')
  }

  const years = Array.from({ length: 50 }, (_, i) => String(2006 - i))
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1))
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1))
  const districts = city ? districtsByCity[city] || [] : []

  const selectClass = 'w-full appearance-none px-4 py-3.5 rounded-2xl border border-neutral-200 bg-white text-body-2 text-neutral-900 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all'
  const canFinish = birthYear && birthMonth && birthDay && city && district

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <TopBar title="프로필 설정" />
      <ProgressBar progress={step === 'mbti' ? 1 / 3 : 1.5 / 3} className="mx-5" />

      <div className="flex-1 px-5 pt-6 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          {/* MBTI Step */}
          {step === 'mbti' && (
            <motion.div
              key="mbti"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-title-1 text-neutral-900 mb-2">MBTI를 알려주세요</h1>
              <p className="text-body-2 text-neutral-500 mb-6">
                성향에 맞는 코스를 추천해 드릴게요
              </p>

              <div className="grid grid-cols-4 gap-2 flex-1 content-start">
                {mbtiOptions.map((option, i) => {
                  const isSelected = selectedMBTI === option.type
                  return (
                    <motion.button
                      key={option.type}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleMBTISelect(option.type)}
                      className={`
                        flex flex-col items-center gap-1 py-3 px-1 rounded-2xl border-2 transition-all
                        ${isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-neutral-100 bg-white'
                        }
                      `}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className={`text-xs font-bold ${isSelected ? 'text-primary-600' : 'text-neutral-800'}`}>
                        {option.type}
                      </span>
                      <span className="text-[10px] text-neutral-400 leading-tight text-center">
                        {option.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="pt-4">
                <Button
                  fullWidth
                  size="lg"
                  disabled={!selectedMBTI}
                  onClick={() => setStep('info')}
                >
                  다음
                </Button>
              </div>
            </motion.div>
          )}

          {/* Birthday + Location Step (combined) */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-title-1 text-neutral-900 mb-2">기본 정보를 알려주세요</h1>
              <p className="text-body-2 text-neutral-500 mb-6">
                나이와 지역에 맞는 장소를 추천해 드릴게요
              </p>

              {/* Birthday */}
              <p className="text-caption font-semibold text-neutral-400 mb-2">생년월일</p>
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <div className="relative">
                    <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} className={selectClass}>
                      <option value="">년도</option>
                      {years.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className={selectClass}>
                      <option value="">월</option>
                      {months.map((m) => <option key={m} value={m}>{m}월</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className={selectClass}>
                      <option value="">일</option>
                      {days.map((d) => <option key={d} value={d}>{d}일</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <p className="text-caption font-semibold text-neutral-400 mb-2">거주지역</p>
              <div className="flex gap-3 mb-5">
                <div className="flex-1">
                  <div className="relative">
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
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className={selectClass}
                      disabled={!city}
                    >
                      <option value="">시/군/구</option>
                      {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Summary */}
              {birthYear && birthMonth && birthDay && city && district && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-5 py-4 rounded-2xl bg-primary-50 mb-4"
                >
                  <p className="text-body-2 text-primary-600 text-center font-medium">
                    {2026 - Number(birthYear)}세 · {city} {district}
                  </p>
                </motion.div>
              )}

              <div className="flex-1" />

              <div className="pt-4 flex gap-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => setStep('mbti')}
                >
                  이전
                </Button>
                <Button
                  fullWidth
                  size="lg"
                  disabled={!canFinish}
                  onClick={handleNext}
                >
                  다음
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
