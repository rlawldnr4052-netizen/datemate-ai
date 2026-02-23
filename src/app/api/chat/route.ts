import { NextRequest, NextResponse } from 'next/server'
import { chatWithGemini, chatWithGeminiStream, type GeminiMessage } from '@/lib/api/gemini'
import { getChatSystemPrompt } from '@/lib/prompts'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, userProfile, stream } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages 배열이 필요합니다.' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      return NextResponse.json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
    }

    const systemPrompt = getChatSystemPrompt(userProfile || {
      dateType: null,
      likedTags: [],
      dislikedTags: [],
      mbti: null,
      birthday: null,
      location: null,
      selectedVibe: null,
    })

    // Convert chat messages to Gemini format
    const geminiMessages: GeminiMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      content: m.content,
    }))

    if (stream) {
      const readableStream = await chatWithGeminiStream(geminiMessages, systemPrompt)

      return new Response(
        readableStream.pipeThrough(new TextEncoderStream()),
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
          },
        }
      )
    }

    const response = await chatWithGemini(geminiMessages, systemPrompt)

    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'AI 응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
