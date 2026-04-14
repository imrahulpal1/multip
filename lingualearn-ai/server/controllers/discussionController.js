import Discussion from '../models/Discussion.js'
import User from '../models/User.js'
import { askOpenAI } from '../services/openai.js'

// io is injected from server/index.js after socket setup
let _io = null
export const setIo = (io) => { _io = io }
const emit = (event, data) => { if (_io) _io.emit(event, data) }

// ── Translation helpers ────────────────────────────────────────────────────

/**
 * Context-aware translation prompt.
 * Preserves technical grammar/linguistics terms by instructing the LLM
 * to keep them in English inside [brackets] so they survive translation.
 */
const buildTranslationPrompt = (title, content, sourceLang, targetLang, technicalTerms) => {
  const termsHint = technicalTerms.length
    ? `The following are technical linguistics/grammar terms — keep them in English inside square brackets, do NOT translate them: ${technicalTerms.join(', ')}.`
    : 'If you encounter technical grammar or linguistics terms (e.g. subjunctive, morpheme, phoneme, syntax), keep them in English inside square brackets.'

  return `You are a context-aware multilingual academic translator for a language learning platform.

Translate the following doubt (question) from ${sourceLang} to ${targetLang}.
${termsHint}
Preserve the original meaning, tone, and nuance exactly — do not simplify or paraphrase.

Return ONLY valid JSON (no markdown fences):
{
  "title": "translated title in ${targetLang}",
  "content": "translated content in ${targetLang}",
  "technicalTerms": ["list", "of", "technical", "terms", "found"]
}

Original title (${sourceLang}): ${title}
Original content (${sourceLang}): ${content}`
}

/**
 * Translate a discussion into targetLang.
 * Returns { title, content, technicalTerms } — falls back to original on error.
 */
const translateDoubt = async (title, content, sourceLang, targetLang, technicalTerms = []) => {
  if (sourceLang === targetLang) return { title, content, technicalTerms }

  const fallback = JSON.stringify({ title, content, technicalTerms })
  const prompt = buildTranslationPrompt(title, content, sourceLang, targetLang, technicalTerms)

  try {
    const raw = await askOpenAI(prompt, fallback)
    const parsed = JSON.parse(raw)
    return {
      title: parsed.title || title,
      content: parsed.content || content,
      technicalTerms: parsed.technicalTerms || technicalTerms,
    }
  } catch {
    return { title, content, technicalTerms }
  }
}

/**
 * Translate a reply into targetLang.
 * Returns translated string — falls back to original on error.
 */
const translateReply = async (content, sourceLang, targetLang, technicalTerms = []) => {
  if (sourceLang === targetLang) return content

  const termsHint = technicalTerms.length
    ? `Keep these technical terms in English inside brackets: ${technicalTerms.join(', ')}.`
    : 'Keep any technical grammar/linguistics terms in English inside square brackets.'

  const prompt = `Translate this reply from ${sourceLang} to ${targetLang}. ${termsHint} Return ONLY the translated text, nothing else.\n\nReply: ${content}`

  try {
    return await askOpenAI(prompt, content)
  } catch {
    return content
  }
}

// ── Cache helpers ──────────────────────────────────────────────────────────

/**
 * Get translation from cache or generate + persist it.
 */
const getCachedOrTranslate = async (discussion, targetLang) => {
  const cacheKey = targetLang
  if (discussion.translationsCache.get(cacheKey)) {
    return JSON.parse(discussion.translationsCache.get(cacheKey))
  }

  const translated = await translateDoubt(
    discussion.title,
    discussion.content,
    discussion.sourceLanguage || discussion.language,
    targetLang,
    discussion.technicalTerms,
  )

  discussion.translationsCache.set(cacheKey, JSON.stringify(translated))
  await Discussion.findByIdAndUpdate(discussion._id, {
    $set: { [`translationsCache.${cacheKey}`]: JSON.stringify(translated) },
  })

  return translated
}

const getCachedOrTranslateReply = async (discussion, reply, targetLang) => {
  const cacheKey = targetLang
  if (reply.translationsCache?.get(cacheKey)) {
    return reply.translationsCache.get(cacheKey)
  }

  const translated = await translateReply(
    reply.content,
    reply.sourceLanguage || reply.language,
    targetLang,
    discussion.technicalTerms,
  )

  await Discussion.findOneAndUpdate(
    { _id: discussion._id, 'replies._id': reply._id },
    { $set: { [`replies.$.translationsCache.${cacheKey}`]: translated } },
  )

  return translated
}

// ── Route handlers ─────────────────────────────────────────────────────────

export const listDiscussions = async (req, res) => {
  const targetLang = req.query.language || 'English'
  const discussions = await Discussion.find().sort({ createdAt: -1 })

  const mapped = await Promise.all(
    discussions.map(async (item) => {
      const sourceLang = item.sourceLanguage || item.language
      const translated = await getCachedOrTranslate(item, targetLang)

      const replies = await Promise.all(
        item.replies.map(async (reply) => {
          const translatedReply = await getCachedOrTranslateReply(item, reply, targetLang)
          return {
            ...reply.toObject(),
            translatedContent: translatedReply,
          }
        }),
      )

      return {
        ...item.toObject(),
        sourceLanguage: sourceLang,
        translatedTitle: translated.title,
        translatedContent: translated.content,
        replies,
      }
    }),
  )

  res.json(mapped)
}

export const createDiscussion = async (req, res) => {
  const { title, content, language = 'English' } = req.body

  // Extract technical terms on creation so all future translations preserve them
  const termPrompt = `Extract any technical linguistics or grammar terms from this text. Return ONLY a JSON array of strings, e.g. ["subjunctive","morpheme"]. If none, return [].
Text: ${title} ${content}`

  let technicalTerms = []
  try {
    const raw = await askOpenAI(termPrompt, '[]')
    technicalTerms = JSON.parse(raw)
    if (!Array.isArray(technicalTerms)) technicalTerms = []
  } catch { /* non-critical */ }

  const discussion = await Discussion.create({
    user: req.user.id,
    title,
    content,
    sourceLanguage: language,
    language, // compat
    technicalTerms,
    approved: false,
  })

  emit('discussion:new', discussion)
  res.status(201).json(discussion)
}

export const replyDiscussion = async (req, res) => {
  const { content, language = 'English' } = req.body
  const discussion = await Discussion.findById(req.params.id)

  discussion.replies.push({
    user: req.user.id,
    sourceLanguage: language,
    language, // compat
    content,
  })

  await discussion.save()
  await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } })
  emit('discussion:reply', { discussionId: req.params.id })
  res.json(discussion)
}

export const upvoteDiscussion = async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { $inc: { upvotes: 1 } },
    { new: true },
  )
  await User.findByIdAndUpdate(req.user.id, { $inc: { points: 5 } })
  res.json(discussion)
}

export const approveDiscussion = async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true },
  )
  res.json(discussion)
}
