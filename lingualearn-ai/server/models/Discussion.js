import mongoose from 'mongoose'

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceLanguage: { type: String, default: 'English' },
    // keep old field for compat
    language: { type: String, default: 'English' },
    content: String,
    // cache: { Hindi: '...', French: '...' }
    translationsCache: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
)

const discussionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sourceLanguage: { type: String, default: 'English' },
    // keep old field for compat
    language: { type: String, default: 'English' },
    title: String,
    content: String,
    // cache: { Hindi: '{ title, content }', French: '...' }
    translationsCache: { type: Map, of: String, default: {} },
    // extracted by AI on creation e.g. ["subjunctive", "morpheme"]
    technicalTerms: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
    replies: [replySchema],
  },
  { timestamps: true },
)

export default mongoose.model('Discussion', discussionSchema)
