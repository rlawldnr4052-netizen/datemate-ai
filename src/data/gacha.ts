export interface SubwayLine {
  id: string
  name: string
  color: string
  stations: string[]
}

export const subwayLines: SubwayLine[] = [
  {
    id: 'line1',
    name: '1호선',
    color: '#0052A4',
    stations: ['서울역', '시청', '종각', '종로3가', '종로5가', '동대문', '동묘앞', '신설동', '제기동', '청량리', '회기', '외대앞', '신이문', '석계', '광운대', '구로', '개봉', '오류동', '역곡', '부천', '인천'],
  },
  {
    id: 'line2',
    name: '2호선',
    color: '#00A84D',
    stations: ['시청', '을지로입구', '을지로3가', '을지로4가', '동대문역사문화공원', '신당', '상왕십리', '왕십리', '한양대', '뚝섬', '성수', '건대입구', '구의', '잠실나루', '잠실', '잠실새내', '종합운동장', '삼성', '선릉', '역삼', '강남', '교대', '서초', '방배', '사당', '낙성대', '서울대입구', '봉천', '신림', '신대방', '구로디지털단지', '대림', '신도림', '문래', '영등포구청', '당산', '합정', '홍대입구', '신촌', '이대', '아현', '충정로'],
  },
  {
    id: 'line3',
    name: '3호선',
    color: '#EF7C1C',
    stations: ['대화', '주엽', '정발산', '마두', '백석', '대곡', '화정', '원당', '삼송', '지축', '구파발', '연신내', '불광', '녹번', '홍제', '무악재', '독립문', '경복궁', '안국', '종로3가', '을지로3가', '충무로', '동대입구', '약수', '금호', '옥수', '압구정', '신사', '잠원', '고속터미널', '교대', '남부터미널', '양재', '매봉', '도곡', '대치', '학여울', '대청', '일원', '수서'],
  },
  {
    id: 'line4',
    name: '4호선',
    color: '#00A5DE',
    stations: ['당고개', '상계', '노원', '창동', '쌍문', '수유', '미아', '미아사거리', '성신여대입구', '한성대입구', '혜화', '동대문', '동대문역사문화공원', '충무로', '명동', '회현', '서울역', '숙대입구', '삼각지', '신용산', '이촌', '동작', '이수', '사당', '남태령'],
  },
  {
    id: 'line5',
    name: '5호선',
    color: '#996CAC',
    stations: ['방화', '개화산', '김포공항', '송정', '마곡', '발산', '우장산', '화곡', '까치산', '신정', '목동', '오목교', '양평', '영등포구청', '영등포시장', '신길', '여의도', '여의나루', '마포', '공덕', '애오개', '충정로', '서대문', '광화문', '종로3가', '을지로4가', '동대문역사문화공원', '청구', '신금호', '행당', '왕십리', '마장', '답십리', '장한평', '군자', '아차산', '광나루', '천호', '강동', '길동', '굽은다리', '명일', '고덕', '상일동'],
  },
  {
    id: 'line6',
    name: '6호선',
    color: '#CD7C2F',
    stations: ['응암', '역촌', '불광', '독바위', '연신내', '구산', '새절', '증산', '디지털미디어시티', '월드컵경기장', '마포구청', '망원', '합정', '상수', '광흥창', '대흥', '공덕', '효창공원앞', '삼각지', '녹사평', '이태원', '한강진', '버티고개', '약수', '청구', '신당', '동묘앞', '창신', '보문', '안암', '고려대', '월곡', '상월곡', '돌곶이', '석계', '태릉입구', '화랑대', '봉화산'],
  },
  {
    id: 'line7',
    name: '7호선',
    color: '#747F00',
    stations: ['장암', '도봉산', '수락산', '마들', '노원', '중계', '하계', '공릉', '태릉입구', '먹골', '중화', '상봉', '면목', '사가정', '용마산', '중곡', '군자', '어린이대공원', '건대입구', '뚝섬유원지', '청담', '강남구청', '학동', '논현', '반포', '고속터미널', '내방', '이수', '남성', '숭실대입구', '상도', '장승배기', '신대방삼거리', '보라매', '신풍', '대림', '남구로', '가산디지털단지', '철산', '광명사거리', '천왕', '온수'],
  },
  {
    id: 'line8',
    name: '8호선',
    color: '#E6186C',
    stations: ['암사', '천호', '강동구청', '몽촌토성', '잠실', '석촌', '송파', '가락시장', '문정', '장지', '복정', '산성', '남한산성입구', '단대오거리', '신흥', '수진', '모란'],
  },
  {
    id: 'line9',
    name: '9호선',
    color: '#BDB092',
    stations: ['개화', '김포공항', '공항시장', '신방화', '마곡나루', '양천향교', '가양', '증미', '등촌', '염창', '신목동', '선유도', '당산', '국회의사당', '여의도', '샛강', '노량진', '노들', '흑석', '동작', '구반포', '신반포', '고속터미널', '사평', '신논현', '언주', '선정릉', '삼성중앙', '봉은사', '종합운동장', '삼전', '석촌고분', '석촌', '송파나루', '한성백제', '올림픽공원', '둔촌오륜', '중앙보훈병원'],
  },
  {
    id: 'gyeongui',
    name: '경의중앙선',
    color: '#77C4A3',
    stations: ['문산', '파주', '월롱', '금촌', '금릉', '운정', '야당', '탄현', '일산', '풍산', '백마', '곡산', '대곡', '능곡', '행신', '강매', '화전', '수색', '디지털미디어시티', '가좌', '홍대입구', '서강대', '공덕', '효창공원앞', '용산', '이촌', '서빙고', '한남', '옥수', '응봉', '왕십리', '청량리', '회기', '중랑', '상봉', '망우', '양원', '구리', '도농', '양정', '덕소', '도심', '팔당', '운길산', '양수', '신원', '국수', '아신', '오빈', '양평', '원덕', '용문'],
  },
  {
    id: 'bundang',
    name: '수인분당선',
    color: '#FABE00',
    stations: ['청량리', '왕십리', '서울숲', '압구정로데오', '강남구청', '선정릉', '선릉', '한티', '도곡', '구룡', '개포동', '대모산입구', '수서', '복정', '가천대', '태평', '모란', '야탑', '이매', '서현', '수내', '정자', '미금', '오리', '죽전', '보정', '구성', '신갈', '기흥', '상갈', '청명', '영통', '망포', '매탄권선', '수원시청', '매교', '수원'],
  },
  {
    id: 'shinbundang',
    name: '신분당선',
    color: '#D31145',
    stations: ['신사', '논현', '신논현', '강남', '양재', '양재시민의숲', '청계산입구', '판교', '정자', '미금', '동천', '수지구청', '성복', '상현', '광교중앙', '광교'],
  },
]

export interface GachaOption {
  id: string
  label: string
  icon?: string
  color?: string
}

export const mealTypes: GachaOption[] = [
  { id: 'korean', label: '한식', color: '#EF4444' },
  { id: 'chinese', label: '중식', color: '#F59E0B' },
  { id: 'japanese', label: '일식', color: '#EC4899' },
  { id: 'western', label: '양식', color: '#8B5CF6' },
  { id: 'snack', label: '분식', color: '#F97316' },
  { id: 'seafood', label: '해산물', color: '#06B6D4' },
  { id: 'meat', label: '고기', color: '#DC2626' },
  { id: 'asian', label: '아시안', color: '#10B981' },
]

export const payerOptions: GachaOption[] = [
  { id: 'me', label: '내가 쏜다', color: '#6366F1' },
  { id: 'you', label: '네가 쏴', color: '#EC4899' },
  { id: 'dutch', label: '더치페이', color: '#10B981' },
  { id: 'random_each', label: '매번 랜덤', color: '#F59E0B' },
]

export const cafeKeywords: GachaOption[] = [
  { id: 'crispy', label: '바삭', color: '#F59E0B' },
  { id: 'sweet', label: '달콤', color: '#EC4899' },
  { id: 'bitter', label: '씁쓸', color: '#78716C' },
  { id: 'cool', label: '시원', color: '#06B6D4' },
  { id: 'nutty', label: '고소', color: '#D97706' },
  { id: 'creamy', label: '부드러운', color: '#A78BFA' },
  { id: 'fruity', label: '상큼', color: '#34D399' },
  { id: 'rich', label: '진한', color: '#7C3AED' },
]

export const activityTypes: GachaOption[] = [
  { id: 'walk', label: '산책', color: '#10B981' },
  { id: 'exhibition', label: '전시회', color: '#8B5CF6' },
  { id: 'movie', label: '영화', color: '#3B82F6' },
  { id: 'bar', label: '술집', color: '#EF4444' },
  { id: 'workshop', label: '공방체험', color: '#F59E0B' },
  { id: 'karaoke', label: '노래방', color: '#EC4899' },
  { id: 'game', label: '오락실/보드게임', color: '#6366F1' },
  { id: 'photo', label: '사진 스팟', color: '#14B8A6' },
]

// ═══════════════════════════
// 모드 타입
// ═══════════════════════════
export type GachaMode = 'couple' | 'friends' | 'solo'

// ═══════════════════════════
// 친구 모드 전용 데이터
// ═══════════════════════════
export const friendsAreas: GachaOption[] = [
  { id: 'hongdae', label: '홍대/연남', color: '#FF6B6B' },
  { id: 'gangnam', label: '강남/역삼', color: '#4ECDC4' },
  { id: 'seongsu', label: '성수/서울숲', color: '#45B7D1' },
  { id: 'itaewon', label: '이태원/한남', color: '#96CEB4' },
  { id: 'kondae', label: '건대/광진', color: '#FFEAA7' },
  { id: 'jamsil', label: '잠실/송파', color: '#DDA0DD' },
  { id: 'sinchon', label: '신촌/이대', color: '#98D8C8' },
  { id: 'yeouido', label: '여의도', color: '#F7DC6F' },
]

export const friendsMeals: GachaOption[] = [
  { id: 'chicken', label: '치킨', color: '#FFB347' },
  { id: 'pork', label: '삼겹살', color: '#FF6B6B' },
  { id: 'pizza', label: '피자', color: '#FF8C69' },
  { id: 'sushi', label: '회/초밥', color: '#87CEEB' },
  { id: 'tteok', label: '떡볶이', color: '#FF4444' },
  { id: 'jokbal', label: '족발/보쌈', color: '#D4A574' },
  { id: 'gopchang', label: '곱창', color: '#E8A87C' },
  { id: 'chinese', label: '중식', color: '#FF6347' },
]

export const friendsPayers: GachaOption[] = [
  { id: 'split', label: 'N빵', color: '#4ECDC4' },
  { id: 'ladder', label: '사다리 타기', color: '#FF6B6B' },
  { id: 'youngest', label: '막내가 쏜다', color: '#DDA0DD' },
  { id: 'rps', label: '가위바위보 진 사람', color: '#FFD700' },
]

export const friendsActivities: GachaOption[] = [
  { id: 'karaoke', label: '노래방', color: '#FF69B4' },
  { id: 'board', label: '보드게임카페', color: '#4ECDC4' },
  { id: 'escape', label: '방탈출', color: '#9B59B6' },
  { id: 'arcade', label: '오락실', color: '#F39C12' },
  { id: 'bowling', label: '볼링', color: '#3498DB' },
  { id: 'pc', label: 'PC방', color: '#2ECC71' },
  { id: 'dart', label: '다트바', color: '#E74C3C' },
  { id: 'pocha', label: '포차', color: '#FF8C00' },
]

export const friendsPenalties: GachaOption[] = [
  { id: 'truth', label: '진실 or 거짓', color: '#FF69B4' },
  { id: 'sing', label: '랜덤 노래 부르기', color: '#FFD700' },
  { id: 'selfie', label: '셀카 찍어 올리기', color: '#4ECDC4' },
  { id: 'next', label: '다음 약속 잡기', color: '#9B59B6' },
  { id: 'imitate', label: '성대모사 하기', color: '#FF6B6B' },
  { id: 'aegyo', label: '애교 부리기', color: '#FF69B4' },
]

export const areaToRegion: Record<string, string> = {
  '홍대/연남': '마포구',
  '강남/역삼': '강남구',
  '성수/서울숲': '성동구',
  '이태원/한남': '용산구',
  '건대/광진': '광진구',
  '잠실/송파': '송파구',
  '신촌/이대': '서대문구',
  '여의도': '영등포구',
}

// ═══════════════════════════
// 혼놀 모드 전용 데이터
// ═══════════════════════════
export const soloVibes: GachaOption[] = [
  { id: 'emotional', label: '감성적', color: '#DDA0DD' },
  { id: 'hip', label: '힙한', color: '#FF6B6B' },
  { id: 'quiet', label: '조용한', color: '#87CEEB' },
  { id: 'lively', label: '활기찬', color: '#FFD700' },
  { id: 'retro', label: '레트로', color: '#D4A574' },
  { id: 'nature', label: '자연속', color: '#98D8C8' },
]

export const soloMeals: GachaOption[] = [
  { id: 'ramen', label: '라멘', color: '#FFB347' },
  { id: 'donburi', label: '덮밥', color: '#FF8C69' },
  { id: 'gukbap', label: '국밥', color: '#D4A574' },
  { id: 'pasta', label: '파스타', color: '#FF6347' },
  { id: 'curry', label: '카레', color: '#FFD700' },
  { id: 'bunsik', label: '김밥/분식', color: '#FF4444' },
  { id: 'bakery', label: '베이커리', color: '#DDA0DD' },
  { id: 'salad', label: '샐러드', color: '#98D8C8' },
]

export const soloCafeTypes: GachaOption[] = [
  { id: 'work', label: '작업하기 좋은', color: '#4ECDC4' },
  { id: 'dessert', label: '디저트 맛집', color: '#FF69B4' },
  { id: 'view', label: '뷰 좋은', color: '#87CEEB' },
  { id: 'retro', label: '레트로 감성', color: '#D4A574' },
  { id: 'reading', label: '조용한 독서', color: '#9B59B6' },
  { id: 'cozy', label: '아늑한', color: '#FFB347' },
]

export const soloActivities: GachaOption[] = [
  { id: 'bookstore', label: '서점', color: '#9B59B6' },
  { id: 'gallery', label: '미술관/전시', color: '#E74C3C' },
  { id: 'movie', label: '영화', color: '#3498DB' },
  { id: 'park', label: '공원 산책', color: '#2ECC71' },
  { id: 'spa', label: '찜질방', color: '#FFB347' },
  { id: 'photo', label: '사진 스팟', color: '#FF69B4' },
  { id: 'record', label: '레코드샵', color: '#D4A574' },
  { id: 'class', label: '원데이클래스', color: '#4ECDC4' },
]

// ═══════════════════════════
// 지역 매핑
// ═══════════════════════════

// 역 이름에서 가장 가까운 구/지역 추정
export const stationToRegion: Record<string, string> = {
  // 2호선 주요역
  '홍대입구': '마포구', '합정': '마포구', '신촌': '서대문구', '이대': '서대문구',
  '강남': '강남구', '역삼': '강남구', '선릉': '강남구', '삼성': '강남구',
  '잠실': '송파구', '성수': '성동구', '건대입구': '광진구', '구로디지털단지': '구로구',
  '신림': '관악구', '사당': '동작구', '교대': '서초구',
  // 3호선
  '경복궁': '종로구', '안국': '종로구', '압구정': '강남구', '신사': '강남구',
  '고속터미널': '서초구', '양재': '서초구',
  // 4호선
  '명동': '중구', '혜화': '종로구', '이촌': '용산구',
  // 6호선
  '이태원': '용산구', '한강진': '용산구', '녹사평': '용산구',
  '망원': '마포구', '상수': '마포구',
  // 경의중앙선
  '용산': '용산구', '왕십리': '성동구', '청량리': '동대문구',
  // 수인분당선
  '서울숲': '성동구', '압구정로데오': '강남구', '정자': '성남시 분당구',
  '판교': '성남시 분당구',
  // 신분당선 (강남은 2호선에서 이미 포함)
}

// 역 → 지역 추정 (stationToRegion에 없으면 역 이름 기반)
export function getRegionFromStation(station: string): string {
  if (stationToRegion[station]) return stationToRegion[station]
  // 기본: 역 이름 + 주변 으로 검색
  return station
}
