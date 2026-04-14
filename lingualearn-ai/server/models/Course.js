import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema(
  {
    name: String,
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: false },
)

const moduleSchema = new mongoose.Schema(
  {
    title: String,
    topics: [topicSchema],
  },
  { _id: false },
)

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: String,
    discipline: { type: String, default: 'CSE' },
    level: { type: String, default: 'Intermediate' },
    modules: [moduleSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Course', courseSchema)
