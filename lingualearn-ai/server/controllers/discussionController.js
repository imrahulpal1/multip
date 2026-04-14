import Discussion from '../models/Discussion.js'
import User from '../models/User.js'

const pseudoTranslate = (text, toLanguage) => `[${toLanguage}] ${text}`

export const listDiscussions = async (req, res) => {
  const language = req.query.language || 'English'
  const discussions = await Discussion.find().sort({ createdAt: -1 })
  const mapped = discussions.map((item) => ({
    ...item.toObject(),
    translatedContent: pseudoTranslate(item.content, language),
    replies: item.replies.map((reply) => ({
      ...reply.toObject(),
      translatedContent: pseudoTranslate(reply.content, language),
    })),
  }))
  res.json(mapped)
}

export const createDiscussion = async (req, res) => {
  const discussion = await Discussion.create({
    user: req.user.id,
    title: req.body.title,
    content: req.body.content,
    language: req.body.language || 'English',
    approved: false,
  })
  res.status(201).json(discussion)
}

export const replyDiscussion = async (req, res) => {
  const discussion = await Discussion.findById(req.params.id)
  discussion.replies.push({
    user: req.user.id,
    language: req.body.language || 'English',
    content: req.body.content,
  })
  await discussion.save()
  await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } })
  res.json(discussion)
}

export const upvoteDiscussion = async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.id, { $inc: { upvotes: 1 } }, { new: true })
  await User.findByIdAndUpdate(req.user.id, { $inc: { points: 5 } })
  res.json(discussion)
}

export const approveDiscussion = async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.id, { approved: true }, { new: true })
  res.json(discussion)
}
