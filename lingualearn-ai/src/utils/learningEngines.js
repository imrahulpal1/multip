const disciplineDictionary = {
  biology: {
    cell: { es: 'celula biologica', fr: 'cellule biologique', de: 'biologische Zelle', hi: 'जैविक कोशिका' },
  },
  physics: {
    cell: { es: 'celda electroquimica', fr: 'cellule electrochimique', de: 'elektrochemische Zelle', hi: 'विद्युत रासायनिक सेल' },
  },
  history: {
    cell: { es: 'celda de prision', fr: 'cellule de prison', de: 'Gefangniszelle', hi: 'कारागार कक्ष' },
  },
}

const languageMap = { spanish: 'es', french: 'fr', german: 'de', hindi: 'hi', english: 'en' }

export const contextAwareTranslate = ({ text, discipline, targetLanguage }) => {
  const lang = languageMap[targetLanguage.toLowerCase()] || 'en'
  let translated = text

  Object.entries(disciplineDictionary[discipline] || {}).forEach(([term, values]) => {
    const termTranslation = values[lang]
    if (termTranslation) {
      translated = translated.replace(new RegExp(`\\b${term}\\b`, 'gi'), termTranslation)
    }
  })

  return translated
}

export const lectureCompanion = ({ text, targetLanguage }) => {
  const chunks = text.split(/[.!?]/).map((line) => line.trim()).filter(Boolean)
  const summary = chunks.slice(0, 2).join('. ') || 'No content provided.'
  const keyTakeaways = chunks.slice(0, 4).map((item) => `- ${item}`)
  const simplified = `In simple ${targetLanguage}: ${summary}`
  return { summary, keyTakeaways, simplified }
}

export const getAdaptivePath = ({ averageScore, courseLevel }) => {
  const normalized = courseLevel.toLowerCase()
  const base = normalized === 'advanced' ? 3 : normalized === 'intermediate' ? 2 : 1
  const difficultyTier = averageScore >= 85 ? base + 1 : averageScore >= 60 ? base : Math.max(1, base - 1)
  const label = difficultyTier >= 4 ? 'Expert' : difficultyTier === 3 ? 'Advanced' : difficultyTier === 2 ? 'Intermediate' : 'Beginner'

  return {
    difficulty: label,
    recommendedReading:
      difficultyTier >= 3 ? 'Case-study heavy reading modules' : 'Guided concept notes with examples',
    quizMode: difficultyTier >= 3 ? 'Timed scenario quiz' : 'Foundational checkpoint quiz',
  }
}

export const translateForumText = (text, fromLanguage, toLanguage) => {
  if (fromLanguage === toLanguage) return text
  return `[${fromLanguage} -> ${toLanguage}] ${text}`
}
