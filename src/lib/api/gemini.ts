const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export interface GeminiMessage {
  role: 'user' | 'model'
  content: string
}

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function chatWithGemini(
  messages: GeminiMessage[],
  systemPrompt: string
): Promise<string> {
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: groqMessages,
      temperature: 0.8,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Groq API error: ${res.status} - ${error}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export async function chatWithGeminiStream(
  messages: GeminiMessage[],
  systemPrompt: string
): Promise<ReadableStream<string>> {
  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.content,
    })),
  ]

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: groqMessages,
      temperature: 0.8,
      max_tokens: 2048,
      stream: true,
    }),
  })

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`)
  }

  return new ReadableStream<string>({
    async start(controller) {
      const reader = res.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))
        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const text = parsed.choices?.[0]?.delta?.content
            if (text) controller.enqueue(text)
          } catch {}
        }
      }
      controller.close()
    },
  })
}

export async function generateStructuredResponse(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 4096,
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Groq API error: ${res.status} - ${error}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
