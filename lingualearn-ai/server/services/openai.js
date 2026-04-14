/* global process */
import OpenAI from 'openai'

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null

export const askOpenAI = async (prompt, fallback) => {
  if (!client) return fallback
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  })
  return response.choices[0]?.message?.content || fallback
}
