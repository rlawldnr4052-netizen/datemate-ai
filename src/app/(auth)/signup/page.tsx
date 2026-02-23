'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import PageTransition from '@/components/motion/PageTransition'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = '이름을 입력해주세요'
    if (!email.trim()) newErrors.email = '이메일을 입력해주세요'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = '올바른 이메일 형식이 아닙니다'
    if (!password) newErrors.password = '비밀번호를 입력해주세요'
    else if (password.length < 6) newErrors.password = '6자 이상 입력해주세요'
    if (password !== confirmPassword) newErrors.confirmPassword = '비밀번호가 일치하지 않습니다'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const result = signup(name.trim(), email.trim(), password)
    if (result.success) {
      router.push('/profile-details')
    } else {
      setErrors({ email: result.error || '회원가입에 실패했습니다' })
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
            데이트메이트 시작하기
          </h1>
          <p className="text-body-2 text-neutral-500">
            나만의 맞춤 데이트 코스를 만들어 보세요
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
            label="이름"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
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
            placeholder="6자 이상 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
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
            가입하기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <button
            onClick={() => router.push('/login')}
            className="text-body-2 text-neutral-400 text-center py-2"
          >
            이미 계정이 있으신가요? <span className="text-primary-500 font-medium">로그인</span>
          </button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
