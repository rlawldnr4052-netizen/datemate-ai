'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function LoginPage() {
  const router = useRouter()
  const { login, _hasHydrated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = '이메일을 입력해주세요'
    if (!password) newErrors.password = '비밀번호를 입력해주세요'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    if (!_hasHydrated) {
      setErrors({ email: '잠시만 기다려주세요...' })
      // 잠시 후 재시도
      setTimeout(() => {
        const result = useAuthStore.getState().login(email.trim(), password)
        if (result.success) {
          const isComplete = useOnboardingStore.getState().isComplete
          router.push(isComplete ? '/home' : '/type')
        } else {
          setErrors({ email: result.error || '로그인에 실패했습니다' })
        }
      }, 300)
      return
    }

    const result = login(email.trim(), password)
    if (result.success) {
      const isComplete = useOnboardingStore.getState().isComplete
      router.push(isComplete ? '/home' : '/type')
    } else {
      setErrors({ email: result.error || '로그인에 실패했습니다' })
    }
  }

  return (
    <PageTransition className="min-h-screen flex flex-col">
      <div className="flex-1 px-5 pt-16 pb-6 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #FF8A75, #E8523A)' }}
          >
            <Heart className="w-7 h-7 text-white" fill="white" />
          </motion.div>
          <h1 className="text-title-1 text-neutral-900 mb-2">
            다시 만나서 반가워요
          </h1>
          <p className="text-body-2 text-neutral-500">
            로그인하고 나만의 코스를 확인하세요
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <Input
            label="이메일"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
        </motion.div>

        {/* Spacer */}
        <div className="flex-1 min-h-8" />

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Button fullWidth size="lg" onClick={handleSubmit}>
            로그인
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button
            onClick={() => router.push('/signup')}
            className="text-body-2 text-neutral-400 text-center py-2"
          >
            계정이 없으신가요? <span className="text-primary-500 font-medium">회원가입</span>
          </button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
