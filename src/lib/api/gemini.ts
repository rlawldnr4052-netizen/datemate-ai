import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export interface GeminiMessage {
  role: 'user' | 'model'
  content: string
}

export async function chatWithGemini(
  messages: GeminiMessage[],
  systemPrompt: string
): Promise<string> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      maxOutputTokens: 2048,
    },
  })

  return response.text ?? ''
}

export async function chatWithGeminiStream(
  messages: GeminiMessage[],
  systemPrompt: string
): Promise<ReadableStream<string>> {
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash',
    contents,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      maxOutputTokens: 2048,
    },
  })

  return new ReadableStream<string>({
    async start(controller) {
      for await (const chunk of response) {
        const text = chunk.text
        if (text) {
          controller.enqueue(text)
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
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.6,
      maxOutputTokens: 4096,
    },
  })

  return response.text ?? ''
}
