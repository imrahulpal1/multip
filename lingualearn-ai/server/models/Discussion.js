import mongoose from 'mongoose'

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    language: String,
    content: String,
    translatedContent: String,
  },
  { timestamps: true },
)

const discussionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    language: { type: String, default: 'English' },
    title: String,
    content: String,
    translatedContent: String,
    upvotes: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
    replies: [replySchema],
  },
  { timestamps: true },
)

export default mongoose.model('Discussion', discussionSchema)
