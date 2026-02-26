import { Course } from '@/types/course'
import { DateType, MBTIType, KoreanRegion, Vibe } from '@/types/onboarding'
import { preferenceTags } from '@/data/tags'

interface UserProfile {
  dateType: DateType | null
  likedTags: string[]
  dislikedTags: string[]
  mbti: MBTIType | null
  birthday: string | null
  location: KoreanRegion | null
  selectedVibe: Vibe | null
}

const compatibleVibes: Record<Vibe, Vibe[]> = {
  romantic: ['emotional', 'chill'],
  hip: ['adventure', 'foodie'],
  chill: ['romantic', 'emotional'],
  adventure: ['hip', 'foodie'],
  emotional: ['romantic', 'chill'],
  foodie: ['hip', 'adventure'],
}

// MBTI -> preferred vibes
const mbtiVibePrefs: Record<string, Vibe[]> = {
  // Introverts prefer quieter vibes
  I: ['chill', 'emotional', 'romantic'],
  // Extroverts prefer energetic vibes
  E: ['hip', 'adventure', 'foodie'],
  // Feeling types prefer emotional/romantic
  F: ['romantic', 'emotional'],
  // Thinking types prefer experience-focused
  T: ['hip', 'adventure'],
  // Intuitive types prefer unique/artistic
  N: ['emotional', 'hip'],
  // Sensing types prefer practical/well-known
  S: ['foodie', 'chill'],
}

function getTagLabels(tagIds: string[]): string[] {
  return tagIds
    .map((id) => preferenceTags.find((t) => t.id === id)?.label.replace('#', ''))
    .filter(Boolean) as string[]
}

export function scoreCourse(course: Course, profile: UserProfile): number {
  let score = 0

  // 1. dateType match (30 points)
  if (profile.dateType && course.dateType === profile.dateType) {
    score += 30
  }

  // 2. vibe match (25 points)
  if (profile.selectedVibe) {
    if (course.vibe === profile.selectedVibe) {
      score += 25
    } else if (compatibleVibes[profile.selectedVibe]?.includes(course.vibe)) {
      score += 12
    }
  }

  // 3. tag overlap (20 points)
  if (profile.likedTags.length > 0) {
    const likedLabels = getTagLabels(profile.likedTags)
    const courseTagLabels = course.tags.map((t) => t.replace('#', ''))
    const overlap = courseTagLabels.filter((t) => likedLabels.includes(t)).length
    score += Math.min(overlap * 7, 20)

    // Penalize disliked tags
    const dislikedLabels = getTagLabels(profile.dislikedTags)
    const dislikedOverlap = courseTagLabels.filter((t) => dislikedLabels.includes(t)).length
    score -= dislikedOverlap * 5
  }

  // 4. MBTI compatibility (15 points)
  if (profile.mbti) {
    const ei = profile.mbti[0] // E or I
    const ns = profile.mbti[1] // N or S
    const tf = profile.mbti[2] // T or F

    let mbtiScore = 0
    if (mbtiVibePrefs[ei]?.includes(course.vibe)) mbtiScore += 5
    if (mbtiVibePrefs[ns]?.includes(course.vibe)) mbtiScore += 5
    if (mbtiVibePrefs[tf]?.includes(course.vibe)) mbtiScore += 5
    score += Math.min(mbtiScore, 15)
  }

  // 5. Location proximity (10 points)
  if (profile.location) {
    const userDistrict = profile.location.district
    if (course.region === userDistrict) {
      score += 10
    } else if (profile.location.city === '서울특별시') {
      // Same city bonus
      score += 3
    }
  }

  return Math.max(score, 0)
}

export function getRecommendedCourses(courses: Course[], profile: UserProfile): Course[] {
  return [...courses]
    .map((course) => ({ course, score: scoreCourse(course, profile) }))
    .sort((a, b) => b.score - a.score)
    .map(({ course }) => course)
}

export function getMatchPercent(course: Course, profile: UserProfile): number {
  const score = scoreCourse(course, profile)
  const maxScore = 100
  return Math.min(Math.round((score / maxScore) * 100), 99)
}
