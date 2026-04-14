import { askOpenAI, askOpenAIWithFile } from '../services/openai.js'
import Lecture from '../models/Lecture.js'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

const simulate = (text) => new Promise((resolve) => setTimeout(() => resolve(text), 900))

export const chat = async (req, res) => {
  const { message, context = '', language = 'English', discipline = 'General' } = req.body
  const fallback = await simulate(`[${language}] ${message}`)
  const result = await askOpenAI(
    `Translate the following text to ${language}. Output ONLY the translated text, nothing else. No explanations, no questions, no extra words.

Text: ${message}`,
    fallback
  )
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
  const result = await askOpenAI(`Explain this in ${language} for ${level} level student with examples: ${text}`, fallback)
  res.json({ result })
}

const buildProcessPrompt = (language, exampleLanguage, discipline) => `
You are LinguaLearn AI, an expert multilingual academic tutor.

The user uploaded lecture content. Explanation language: "${language}". Example language: "${exampleLanguage}". Subject: ${discipline}.

Carefully read ALL the content provided and base your response entirely on it.

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "title": "short descriptive title based on the actual content",
  "translation": "full accurate translation of the entire content into ${language}",
  "explanation": "thorough explanation of the main concepts found in the content, written in ${language}, with subject-specific context for ${discipline}",
  "keyTerms": [
    {
      "term": "important word or phrase from the content",
      "meaningInLang": "precise meaning in ${language}",
      "meaningInExample": "precise meaning in ${exampleLanguage}",
      "altMeaning": "alternative meaning if this word has multiple meanings in different contexts, else empty string",
      "examplesInLang": ["original example sentence in ${language} using this term", "second example sentence in ${language}"],
      "examplesInExampleLang": ["example sentence in ${exampleLanguage} using this term", "second example sentence in ${exampleLanguage}"]
    }
  ]
}

Pick 5-6 most important terms directly from the content. All examples must be original sentences you write, not copied from the content.
`

export const processFile = async (req, res) => {
  const { text, fileBase64, fileType, fileName, language = 'English', exampleLanguage = 'English', discipline = 'General' } = req.body

  const prompt = buildProcessPrompt(language, exampleLanguage, discipline)

  const makeFallback = (src) => JSON.stringify({
    title: fileName || 'Uploaded Lecture',
    translation: `[${language}] ${src.slice(0, 300)}...`,
    explanation: `This lecture covers key concepts in ${discipline}. Focus on understanding core terminology and real-world applications.`,
    keyTerms: [
      {
        term: 'Key Concept',
        meaningInLang: `(${language}) A fundamental idea central to this subject`,
        meaningInExample: `(${exampleLanguage}) A fundamental idea central to this subject`,
        altMeaning: '',
        examplesInLang: [`(${language}) This key concept forms the basis of our study.`, `(${language}) Understanding this concept is essential for further learning.`],
        examplesInExampleLang: [`(${exampleLanguage}) This key concept forms the basis of our study.`, `(${exampleLanguage}) Understanding this concept is essential for further learning.`],
      },
    ],
  })

  try {
    let raw

    if (fileBase64 && fileType) {
      // Image file — use GPT-4o vision
      if (fileType.startsWith('image/')) {
        raw = await askOpenAIWithFile({ prompt, fileBase64, fileType, fallback: makeFallback('image content') })
      } else {
        // PDF — extract real text with pdf-parse
        const pdfBuffer = Buffer.from(fileBase64, 'base64')
        let textContent = ''
        try {
          const parsed = await pdfParse(pdfBuffer)
          textContent = parsed.text.slice(0, 8000)
        } catch (e) {
          console.error('[pdf-parse]', e.message)
          textContent = '(PDF text extraction failed)'
        }
        raw = await askOpenAI(`${prompt}\n\nContent extracted from ${fileName}:\n${textContent}`, makeFallback(textContent))
      }
    } else if (text) {
      raw = await askOpenAI(`${prompt}\n\nContent:\n${text}`, makeFallback(text))
    } else {
      return res.status(400).json({ message: 'No content provided' })
    }

    try { return res.json(JSON.parse(raw)) } catch { return res.json(JSON.parse(makeFallback(text || ''))) }
  } catch (err) {
    console.error('[processFile]', err.message)
    return res.json(JSON.parse(makeFallback(text || '')))
  }
}

export const analyzeLecture = async (req, res) => {
  const { transcript, language = 'English', discipline = 'General', sourceTitle = 'Untitled Lecture' } = req.body
  if (!transcript) return res.status(400).json({ message: 'transcript is required' })

  const SYSTEM_PROMPT = `You are an AI Curriculum Architect. Analyze the lecture transcript below and return ONLY valid JSON — no markdown, no extra text.

Language for all output: ${language}. Subject: ${discipline}.

JSON structure:
{
  "executiveSummary": "concise summary under 100 words in ${language}",
  "keyPoints": ["bullet point 1", "bullet point 2", "..."],
  "coreConcepts": [
    {
      "title": "concept name",
      "explanation": "context-aware explanation in ${language}",
      "analogy": "simple analogy suitable for a language learner in ${language}"
    }
  ]
}

Rules:
- executiveSummary: under 100 words
- keyPoints: 5 to 7 items
- coreConcepts: exactly 3 items
- All text must be in ${language}
- Return ONLY the JSON object

Transcript:
${transcript.slice(0, 6000)}`

  const fallback = JSON.stringify({
    executiveSummary: `This lecture covers key topics in ${discipline}.`,
    keyPoints: ['Key concept 1', 'Key concept 2', 'Key concept 3', 'Key concept 4', 'Key concept 5'],
    coreConcepts: [
      { title: 'Core Concept 1', explanation: 'Fundamental idea in this subject.', analogy: 'Like learning to walk before you run.' },
      { title: 'Core Concept 2', explanation: 'Secondary principle covered.', analogy: 'Similar to building blocks stacked together.' },
      { title: 'Core Concept 3', explanation: 'Advanced topic introduced.', analogy: 'Like a recipe — each step depends on the last.' },
    ],
  })

  try {
    const raw = await askOpenAI(SYSTEM_PROMPT, fallback)
    let parsed
    try { parsed = JSON.parse(raw) } catch { parsed = JSON.parse(fallback) }

    const lecture = await Lecture.create({
      user: req.user?.id,
      sourceTitle,
      language,
      discipline,
      executiveSummary: parsed.executiveSummary || '',
      keyPoints: parsed.keyPoints || [],
      coreConcepts: parsed.coreConcepts || [],
    })

    return res.status(201).json({ ...parsed, _id: lecture._id })
  } catch (err) {
    console.error('[analyzeLecture]', err.message)
    return res.status(500).json({ message: 'Analysis failed', error: err.message })
  }
}

export const generateTest = async (req, res) => {
  const { lectureText, language = 'English', discipline = 'General', mistakeTopics = [] } = req.body
  if (!lectureText) return res.status(400).json({ message: 'Lecture text required' })

  const mistakeHint = mistakeTopics.length > 0
    ? `The student previously struggled with: ${mistakeTopics.join(', ')}. Include at least 3 questions on these topics.`
    : ''

  const prompt = `
You are LinguaLearn AI quiz generator.

Read the lecture content carefully and generate exactly 12 multiple-choice questions based ONLY on the actual content provided.
Language: ${language}. Subject: ${discipline}.
${mistakeHint}

Return ONLY valid JSON (no markdown fences):
{
  "questions": [
    {
      "id": 1,
      "question": "specific question about the lecture content in ${language}",
      "options": ["A. option", "B. option", "C. option", "D. option"],
      "correctIndex": 0,
      "topic": "specific topic from the lecture",
      "explanation": "clear explanation of why this answer is correct, referencing the lecture content, in ${language}",
      "wrongExplanations": ["why option A is wrong", "why option B is wrong", "why option C is wrong", "why option D is wrong"]
    }
  ]
}

Lecture content:
${lectureText.slice(0, 6000)}
`

  const fallback = JSON.stringify({
    questions: Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      question: `Based on the lecture, what is the significance of concept ${i + 1}?`,
      options: ['A. It defines the core framework', 'B. It provides practical examples', 'C. It establishes historical context', 'D. It offers empirical evidence'],
      correctIndex: i % 4,
      topic: discipline,
      explanation: `This answer best reflects the core principle discussed in the lecture on ${discipline}.`,
      wrongExplanations: ['This describes a different aspect.', 'While related, this does not directly answer the question.', 'This is a common misconception.', 'This is too broad.'],
    })),
  })

  try {
    const raw = await askOpenAI(prompt, fallback)
    try { return res.json(JSON.parse(raw)) } catch { return res.json(JSON.parse(fallback)) }
  } catch {
    return res.json(JSON.parse(fallback))
  }
}
