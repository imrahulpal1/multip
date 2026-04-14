import mongoose from 'mongoose'

const conceptSchema = new mongoose.Schema({
  title: String,
  explanation: String,
  analogy: String,
}, { _id: false })

const lectureSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sourceTitle: { type: String, default: 'Untitled Lecture' },
  language: { type: String, default: 'English' },
  discipline: { type: String, default: 'General' },
  executiveSummary: { type: String, default: '' },
  keyPoints: [{ type: String }],
  coreConcepts: [conceptSchema],
}, { timestamps: true })

export default mongoose.model('Lecture', lectureSchema)
