/* global process */
import OpenAI from 'openai'

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'LinguaLearn AI',
      },
    })
  : null

const TEXT_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'openai/gpt-oss-20b:free',
]

const VISION_MODELS = [
  'google/gemma-3-27b-it:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
]

const stripFences = (text) => text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

const tryModels = async (models, buildMessages, fallback) => {
  if (!client) {
    console.warn('[OpenRouter] No API key — using fallback')
    return fallback
  }
  for (const model of models) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 20000)
      )
      const response = await Promise.race([
        client.chat.completions.create({
          model,
          messages: buildMessages(),
          temperature: 0.4,
          max_tokens: 2000,
        }),
        timeoutPromise,
      ])
      const content = response.choices[0]?.message?.content
      if (content) return stripFences(content)
    } catch (err) {
      console.warn(`[OpenRouter] ${model} failed: ${err.message}`)
    }
  }
  console.error('[OpenRouter] All models failed — using fallback')
  return fallback
}

export const askOpenAI = (prompt, fallback) =>
  tryModels(TEXT_MODELS, () => [{ role: 'user', content: prompt }], fallback)

export const askOpenAIWithFile = ({ prompt, fileBase64, fileType, fallback }) =>
  tryModels(
    VISION_MODELS,
    () => [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${fileType};base64,${fileBase64}` } },
        ],
      },
    ],
    fallback
  )
