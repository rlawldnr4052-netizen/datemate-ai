'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid3X3,
  Trophy,
  Settings,
  Heart,
  MapPin,
  LogOut,
  RotateCcw,
  Plus,
  Image as ImageIcon,
  X,
  ChevronDown,
  Camera,
  Pencil,
  Check,
  Navigation,
  Target,
  Star,
  Flame,
  Zap,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useQuestStore } from '@/stores/useQuestStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useFeedStore } from '@/stores/useFeedStore'
import { useFriendStore } from '@/stores/useFriendStore'
import { preferenceTags } from '@/data/tags'
import { mbtiOptions } from '@/data/mbti'
import PageTransition from '@/components/motion/PageTransition'
import FeedScrollView from '@/components/feed/FeedScrollView'

const dateTypeLabels: Record<string, string> = {
  couple: '커플',
  solo: '솔로',
  friends: '친구',
}

interface UploadedPhoto {
  id: string
  file: File
  previewUrl: string
  taggedPlaceName: string
  taggedPlaceCategory: string
}

function CreatePostSheet({ onClose }: { onClose: () => void }) {
  const { currentUser } = useAuthStore()
  const { courses } = useCourseStore()
  const { addPost } = useFeedStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [taggingPhotoId, setTaggingPhotoId] = useState<string | null>(null)
  const [step, setStep] = useState<'course' | 'photos' | 'caption'>('course')

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setStep('photos')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      taggedPlaceName: '',
      taggedPlaceCategory: '',
    }))
    setUploadedPhotos((prev) => [...prev, ...newPhotos])
    e.target.value = ''
  }

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => {
      const photo = prev.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.previewUrl)
      return prev.filter((p) => p.id !== id)
    })
  }

  const tagPhotoWithPlace = (photoId: string, placeName: string, placeCategory: string) => {
    setUploadedPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, taggedPlaceName: placeName, taggedPlaceCategory: placeCategory } : p
      )
    )
    setTaggingPhotoId(null)
  }

  const handlePublish = () => {
    if (!selectedCourse || !currentUser || uploadedPhotos.length === 0) return

    const photos = uploadedPhotos.map((p) => ({
      id: p.id,
      imageUrl: p.previewUrl,
      placeName: p.taggedPlaceName || '',
      placeCategory: p.taggedPlaceCategory || '',
    }))

    addPost({
      userId: currentUser.id,
      userName: currentUser.name,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      courseRegion: selectedCourse.region,
      photos,
      caption,
    })

    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-app bg-white rounded-t-3xl overflow-hidden"
        style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
          <button onClick={onClose} className="text-[14px] text-neutral-400">
            취소
          </button>
          <h3 className="text-[16px] font-bold text-neutral-900">새 게시물</h3>
          {step === 'caption' ? (
            <button
              onClick={handlePublish}
              disabled={uploadedPhotos.length === 0}
              className="text-[14px] font-bold text-primary-500 disabled:text-neutral-300"
            >
              공유
            </button>
          ) : (
            <button
              onClick={() => {
                if (step === 'photos') setStep('caption')
              }}
              disabled={step === 'course' || uploadedPhotos.length === 0}
              className="text-[14px] font-bold text-primary-500 disabled:text-neutral-300"
            >
              다음
            </button>
          )}
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(80vh - 56px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Select course */}
            {step === 'course' && (
              <motion.div
                key="course"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5"
              >
                <p className="text-[14px] text-neutral-500 mb-4">어떤 코스를 공유할까요?</p>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <motion.button
                      key={course.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectCourse(course.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-100 hover:border-primary-200 transition-colors text-left"
                    >
                      <div
                        className="w-14 h-14 rounded-xl bg-cover bg-center bg-neutral-100 flex-shrink-0"
                        style={{ backgroundImage: `url(${course.heroImageUrl})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-neutral-900 truncate">
                          {course.title}
                        </p>
                        <p className="text-[12px] text-neutral-400">
                          {course.region} · {course.stops.length}곳
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-neutral-300 -rotate-90" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Upload photos */}
            {step === 'photos' && selectedCourse && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('course')} className="text-[13px] text-primary-500">
                    ← 코스 변경
                  </button>
                </div>
                <p className="text-[14px] text-neutral-500 mb-4">
                  사진을 추가하고, 장소를 태그해보세요 ({uploadedPhotos.length}장)
                </p>

                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center bg-neutral-100"
                        style={{ backgroundImage: `url(${photo.previewUrl})` }}
                      />
                      {/* Remove button */}
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                      {/* Place tag */}
                      <button
                        onClick={() => setTaggingPhotoId(photo.id)}
                        className="absolute bottom-0 left-0 right-0 px-1.5 py-1.5 bg-gradient-to-t from-black/70 to-transparent"
                      >
                        {photo.taggedPlaceName ? (
                          <p className="text-white text-[10px] font-medium truncate text-center">
                            {photo.taggedPlaceName}
                          </p>
                        ) : (
                          <p className="text-white/70 text-[10px] flex items-center justify-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> 장소 태그
                          </p>
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Add photo button */}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Plus className="w-6 h-6 text-neutral-300" />
                    <span className="text-[10px] text-neutral-400">사진 추가</span>
                  </label>
                </div>

                {/* Place tagging popup */}
                <AnimatePresence>
                  {taggingPhotoId && selectedCourse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[13px] font-semibold text-neutral-700">장소 태그하기</p>
                        <button onClick={() => setTaggingPhotoId(null)} className="text-[12px] text-neutral-400">
                          닫기
                        </button>
                      </div>
                      <div className="space-y-2">
                        {selectedCourse.stops.map((stop) => (
                          <motion.button
                            key={stop.place.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => tagPhotoWithPlace(taggingPhotoId, stop.place.name, stop.place.category)}
                            className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-primary-50 transition-colors text-left"
                          >
                            <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-neutral-800 truncate">{stop.place.name}</p>
                              <p className="text-[11px] text-neutral-400">{stop.place.category}</p>
                            </div>
                          </motion.button>
                        ))}
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => tagPhotoWithPlace(taggingPhotoId, '', '')}
                          className="w-full p-2.5 rounded-xl bg-white hover:bg-neutral-100 transition-colors text-[13px] text-neutral-400 text-center"
                        >
                          태그 없이 진행
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Step 3: Caption */}
            {step === 'caption' && selectedCourse && (
              <motion.div
                key="caption"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-5"
              >
                <button onClick={() => setStep('photos')} className="text-[13px] text-primary-500 mb-4">
                  ← 사진 선택
                </button>

                {/* Preview */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
                  {uploadedPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="flex-shrink-0 w-20 h-20 rounded-xl bg-cover bg-center bg-neutral-100"
                      style={{ backgroundImage: `url(${photo.previewUrl})` }}
                    />
                  ))}
                </div>

                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="이 코스에 대해 한마디..."
                  className="w-full h-32 p-4 rounded-2xl bg-neutral-50 text-[14px] text-neutral-900 placeholder:text-neutral-300 outline-none resize-none focus:ring-2 focus:ring-primary-200"
                />

                <div className="mt-4 p-3 rounded-2xl bg-neutral-50 flex items-center gap-3">
                  <Navigation className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-700">{selectedCourse.title}</p>
                    <p className="text-[11px] text-neutral-400">{selectedCourse.region} · {uploadedPhotos.length}장</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { currentUser, logout, updateProfileImage, updateName } = useAuthStore()
  const { dateType, likedTags, mbti, location, reset } = useOnboardingStore()
  const { totalCourses, totalPlaces, activeQuest, completedCount } = useQuestStore()
  const { posts } = useFeedStore()
  const { friends, fetchFriends } = useFriendStore()

  const [activeTab, setActiveTab] = useState<'grid' | 'quest'>('grid')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSavingName, setIsSavingName] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const userId = currentUser?.id || ''
  const userName = currentUser?.name || '사용자'
  const userPosts = posts.filter((p) => p.userId === userId)
  const friendCount = friends.length

  useEffect(() => {
    if (userId) fetchFriends(userId)
  }, [userId, fetchFriends])

  const likedTagLabels = preferenceTags
    .filter((t) => likedTags.includes(t.id))
    .map((t) => t.label)

  const mbtiInfo = mbti ? mbtiOptions.find((o) => o.type === mbti) : null

  const handleEditProfile = () => {
    router.push('/profile/edit')
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      if (dataUrl) updateProfileImage(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleReset = () => {
    reset()
    router.push('/type')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleStartEditName = () => {
    setEditName(userName)
    setIsEditingName(true)
    setTimeout(() => nameInputRef.current?.focus(), 100)
  }

  const handleSaveName = async () => {
    if (!editName.trim() || editName.trim() === userName) {
      setIsEditingName(false)
      return
    }
    setIsSavingName(true)
    const result = await updateName(editName.trim())
    setIsSavingName(false)
    if (result.success) {
      setIsEditingName(false)
    }
  }

  return (
    <PageTransition className="min-h-screen bg-white pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-neutral-100">
        <div className="flex items-center justify-between px-5 py-3">
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1 mr-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                className="flex-1 text-[18px] font-bold text-neutral-900 bg-neutral-50 rounded-lg px-3 py-1 outline-none focus:ring-2 focus:ring-primary-200"
                maxLength={20}
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSaveName}
                disabled={isSavingName}
                className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditingName(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </motion.button>
            </div>
          ) : (
            <button onClick={handleStartEditName} className="flex items-center gap-1.5">
              <h1 className="text-[18px] font-bold text-neutral-900">{userName}</h1>
              <Pencil className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
          {!isEditingName && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEditProfile}
              className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center"
            >
              <Settings className="w-4 h-4 text-neutral-500" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Profile header - Instagram style */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-5">
          {/* Avatar - tap to change */}
          <label className="flex-shrink-0 relative cursor-pointer group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileImageChange}
            />
            <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-primary-300 via-primary-400 to-secondary-400 p-[3px]">
              {currentUser?.profileImageUrl ? (
                <div
                  className="w-full h-full rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentUser.profileImageUrl})` }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <span className="text-[28px] font-bold text-primary-500">
                    {userName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            {/* Camera badge */}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary-500 border-2 border-white flex items-center justify-center">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </label>

          {/* Stats */}
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="text-[18px] font-bold text-neutral-900">{userPosts.length}</p>
              <p className="text-[12px] text-neutral-500">게시물</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-neutral-900">{friendCount}</p>
              <p className="text-[12px] text-neutral-500">친구</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-bold text-neutral-900">{totalCourses}</p>
              <p className="text-[12px] text-neutral-500">코스</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <p className="text-[14px] font-semibold text-neutral-900">{userName}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {dateType && (
              <span className="text-[12px] text-primary-500 font-medium">
                {dateTypeLabels[dateType]}
              </span>
            )}
            {mbtiInfo && (
              <span className="text-[12px] text-violet-500 font-medium">
                {mbtiInfo.emoji} {mbtiInfo.type}
              </span>
            )}
            {location && (
              <span className="text-[12px] text-neutral-400 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {location.city} {location.district}
              </span>
            )}
          </div>

          {/* Tags */}
          {likedTagLabels.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {likedTagLabels.slice(0, 5).map((label) => (
                <span
                  key={label}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[11px] rounded-full"
                >
                  {label}
                </span>
              ))}
              {likedTagLabels.length > 5 && (
                <span className="text-[11px] text-neutral-300">
                  +{likedTagLabels.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Add post button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreatePost(true)}
          className="w-full mt-4 py-2 rounded-lg bg-primary-500 text-[13px] font-semibold text-white flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          피드 추가
        </motion.button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-100 sticky top-[49px] z-20 bg-white">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-3 flex items-center justify-center ${
            activeTab === 'grid'
              ? 'border-b-2 border-neutral-900'
              : 'border-b-2 border-transparent'
          }`}
        >
          <Grid3X3
            className={`w-5 h-5 ${
              activeTab === 'grid' ? 'text-neutral-900' : 'text-neutral-300'
            }`}
          />
        </button>
        <button
          onClick={() => setActiveTab('quest')}
          className={`flex-1 py-3 flex items-center justify-center ${
            activeTab === 'quest'
              ? 'border-b-2 border-neutral-900'
              : 'border-b-2 border-transparent'
          }`}
        >
          <Trophy
            className={`w-5 h-5 ${
              activeTab === 'quest' ? 'text-neutral-900' : 'text-neutral-300'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      {activeTab === 'grid' && (
        <>
          {userPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-5">
              <div className="w-20 h-20 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-neutral-200" />
              </div>
              <p className="text-[16px] font-bold text-neutral-900 mb-1">아직 게시물이 없어요</p>
              <p className="text-[13px] text-neutral-400 text-center mb-5">
                코스를 다녀온 후 사진을 공유해보세요
              </p>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreatePost(true)}
                className="px-6 py-2.5 rounded-full bg-primary-500 text-white text-[13px] font-bold"
              >
                첫 게시물 만들기
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5">
              {userPosts.map((post) => (
                <motion.button
                  key={post.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedPostId(post.id)}
                  className="relative"
                  style={{ aspectRatio: '4/5' }}
                >
                  <div
                    className="w-full h-full bg-cover bg-center bg-neutral-100"
                    style={{ backgroundImage: `url(${post.photos[0]?.imageUrl})` }}
                  />
                  {/* Multi-photo indicator */}
                  {post.photos.length > 1 && (
                    <div className="absolute top-2 right-2">
                      <ImageIcon className="w-4 h-4 text-white drop-shadow-lg" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'quest' && (
        <div className="px-5 py-5">
          {/* Active quest */}
          {activeQuest ? (
            <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-white border border-primary-100 p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary-500" />
                <p className="text-[13px] font-bold text-primary-600">진행 중인 퀘스트</p>
              </div>
              <div className="space-y-2.5">
                {activeQuest.missions.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      m.isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                    }`}>
                      {m.isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-400">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-[13px] ${m.isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-700'}`}>
                      {m.description}
                    </span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(activeQuest.missions.filter((m) => m.isCompleted).length / activeQuest.missions.length) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 mt-1.5">
                {activeQuest.missions.filter((m) => m.isCompleted).length}/{activeQuest.missions.length} 완료
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-neutral-50 p-5 mb-5 text-center">
              <Target className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-[13px] text-neutral-400">진행 중인 퀘스트가 없어요</p>
              <p className="text-[11px] text-neutral-300 mt-0.5">코스를 시작하면 퀘스트가 생겨요</p>
            </div>
          )}

          {/* Activity stats */}
          <div className="mb-5">
            <p className="text-[13px] font-bold text-neutral-700 mb-3">활동 기록</p>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-primary-50">
                <Navigation className="w-5 h-5 text-primary-500" />
                <p className="text-[16px] font-bold text-neutral-900">{totalCourses}</p>
                <p className="text-[10px] text-neutral-400">완료 코스</p>
              </div>
              <div className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-green-50">
                <MapPin className="w-5 h-5 text-green-500" />
                <p className="text-[16px] font-bold text-neutral-900">{totalPlaces}</p>
                <p className="text-[10px] text-neutral-400">방문 장소</p>
              </div>
              <div className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-violet-50">
                <Flame className="w-5 h-5 text-violet-500" />
                <p className="text-[16px] font-bold text-neutral-900">{completedCount}</p>
                <p className="text-[10px] text-neutral-400">퀘스트</p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-5">
            <p className="text-[13px] font-bold text-neutral-700 mb-3">업적</p>
            <div className="space-y-2.5">
              {[
                { icon: Star, label: '첫 코스 완료', desc: '첫 번째 데이트 코스를 완주했어요', unlocked: totalCourses >= 1, color: '#F59E0B', bg: '#FFFBEB' },
                { icon: Flame, label: '코스 마스터', desc: '코스를 5개 이상 완료했어요', unlocked: totalCourses >= 5, color: '#EF4444', bg: '#FEF2F2' },
                { icon: MapPin, label: '탐험가', desc: '20곳 이상의 장소를 방문했어요', unlocked: totalPlaces >= 20, color: '#10B981', bg: '#ECFDF5' },
                { icon: Zap, label: '퀘스트 헌터', desc: '퀘스트를 10개 이상 클리어했어요', unlocked: completedCount >= 10, color: '#8B5CF6', bg: '#F5F3FF' },
                { icon: Heart, label: '소셜 스타', desc: '게시물을 3개 이상 올렸어요', unlocked: userPosts.length >= 3, color: '#EC4899', bg: '#FDF2F8' },
                { icon: Award, label: '맛집 헌터', desc: '50곳 이상의 장소를 방문했어요', unlocked: totalPlaces >= 50, color: '#0EA5E9', bg: '#F0F9FF' },
              ].map((ach) => {
                const Icon = ach.icon
                return (
                  <div
                    key={ach.label}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      ach.unlocked ? '' : 'opacity-40 grayscale'
                    }`}
                    style={{ backgroundColor: ach.unlocked ? ach.bg : '#F9FAFB' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ach.unlocked ? `${ach.color}20` : '#E5E7EB' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: ach.unlocked ? ach.color : '#9CA3AF' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-neutral-800">{ach.label}</p>
                      <p className="text-[11px] text-neutral-400">{ach.desc}</p>
                    </div>
                    {ach.unlocked && (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Settings at bottom */}
          <div className="border-t border-neutral-100 pt-4 space-y-1">
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-neutral-400" />
              <span className="text-[13px] text-neutral-500">온보딩 다시하기</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span className="text-[13px] text-red-500">로그아웃</span>
            </button>
          </div>
        </div>
      )}

      {/* Feed scroll view */}
      <AnimatePresence>
        {selectedPostId && (
          <FeedScrollView
            posts={userPosts}
            startPostId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        )}
      </AnimatePresence>

      {/* Create post sheet */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostSheet onClose={() => setShowCreatePost(false)} />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}
