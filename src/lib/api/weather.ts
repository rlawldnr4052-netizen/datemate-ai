// Open-Meteo API (무료, 키 불필요)
export interface WeatherData {
  temperature: number
  weatherCode: number
  label: string
  emoji: string
  suggestion: string
}

const weatherLabels: Record<number, { label: string; emoji: string; indoor: boolean }> = {
  0: { label: '맑음', emoji: '☀️', indoor: false },
  1: { label: '대체로 맑음', emoji: '🌤', indoor: false },
  2: { label: '구름 조금', emoji: '⛅', indoor: false },
  3: { label: '흐림', emoji: '☁️', indoor: false },
  45: { label: '안개', emoji: '🌫', indoor: false },
  48: { label: '짙은 안개', emoji: '🌫', indoor: true },
  51: { label: '이슬비', emoji: '🌦', indoor: true },
  53: { label: '비', emoji: '🌧', indoor: true },
  55: { label: '강한 비', emoji: '🌧', indoor: true },
  61: { label: '비', emoji: '🌧', indoor: true },
  63: { label: '비', emoji: '🌧', indoor: true },
  65: { label: '폭우', emoji: '⛈', indoor: true },
  71: { label: '눈', emoji: '🌨', indoor: true },
  73: { label: '눈', emoji: '🌨', indoor: true },
  75: { label: '폭설', emoji: '❄️', indoor: true },
  80: { label: '소나기', emoji: '🌦', indoor: true },
  81: { label: '소나기', emoji: '🌧', indoor: true },
  95: { label: '뇌우', emoji: '⛈', indoor: true },
}

function getWeatherInfo(code: number) {
  return weatherLabels[code] || weatherLabels[Math.floor(code / 10) * 10] || { label: '맑음', emoji: '☀️', indoor: false }
}

function getSuggestion(code: number, temp: number): string {
  const info = getWeatherInfo(code)
  if (info.indoor) {
    if (code >= 71) return '눈 오는 날엔 따뜻한 실내 데이트!'
    return '비 오는 날엔 아늑한 카페 데이트 어때요?'
  }
  if (temp >= 28) return '더운 날! 시원한 실내 or 한강 피크닉 추천'
  if (temp <= 0) return '추운 날엔 따뜻한 실내 데이트가 딱!'
  if (temp <= 10) return '쌀쌀해요! 따뜻하게 입고 나가요'
  return '산책하기 좋은 날씨! 야외 데이트 추천'
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=Asia/Seoul`
    )
    if (!res.ok) return null
    const data = await res.json()
    const temp = Math.round(data.current.temperature_2m)
    const code = data.current.weather_code
    const info = getWeatherInfo(code)
    return {
      temperature: temp,
      weatherCode: code,
      label: info.label,
      emoji: info.emoji,
      suggestion: getSuggestion(code, temp),
    }
  } catch {
    return null
  }
}

export function getWeatherPromptContext(weather: WeatherData): string {
  const info = getWeatherInfo(weather.weatherCode)
  return `\n## 현재 날씨\n- 기온: ${weather.temperature}°C\n- 날씨: ${weather.label}\n- ${info.indoor ? '비/눈이 오고 있으니 실내 위주로 추천해줘. 야외 장소는 피해줘.' : '날씨가 좋으니 야외 활동도 포함해줘.'}`
}
