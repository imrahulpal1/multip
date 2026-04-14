import { aiApi } from '../services/api'

const fakeDelay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms))

export const aiService = {
  summarize: async (content) => {
    try {
      const data = await aiApi.summarize({ text: content })
      return data?.result
    } catch {
      await fakeDelay()
      return `Summary generated for: "${content.slice(0, 80)}..."`
    }
  },
  translate: async (content, language) => {
    await fakeDelay()
    return `[${language}] ${content}`
  },
  explain: async (content, language) => {
    try {
      const data = await aiApi.explain({ text: content, language })
      return data?.result
    } catch {
      await fakeDelay()
      return `Explanation in ${language}: "${content.slice(0, 80)}..."`
    }
  },
  chat: async (message, language = 'English', discipline = 'General') => {
    try {
      const data = await aiApi.chat({ message, language, discipline })
      return data?.result
    } catch {
      await fakeDelay()
      return `AI Tutor: Great question! Let's break down "${message}" with a contextual example.`
    }
  },
}
