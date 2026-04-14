import { askOpenAI } from '../services/openai.js'

const simulate = (text) => new Promise((resolve) => setTimeout(() => resolve(text), 900))

export const chat = async (req, res) => {
  const { message, context = '' } = req.body
  const fallback = await simulate(`AI Tutor: Based on ${context || 'your course'}, here is guidance for "${message}".`)
  const result = await askOpenAI(`You are LinguaLearn AI tutor. ${context}. User: ${message}`, fallback)
  res.json({ result })
}

export const summarize = async (req, res) => {
  const { text } = req.body
  const fallback = await simulate(`Summary: ${String(text || '').slice(0, 180)}...`)
  const result = await askOpenAI(`Summarize this lecture in 5 lines: ${text}`, fallback)
  res.json({ result })
}

export const explain = async (req, res) => {
  const { text, level = 'Beginner', language = 'English' } = req.body
  const fallback = await simulate(`Simplified (${language}, ${level}): ${String(text || '').slice(0, 160)}...`)
  const result = await askOpenAI(
    `Explain this in ${language} for ${level} level student with examples: ${text}`,
    fallback,
  )
  res.json({ result })
}
