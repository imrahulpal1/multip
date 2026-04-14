import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    preferredLanguage: { type: String, default: 'English' },
    targetLanguage: { type: String, default: 'English' },
    academicLevel: { type: String, default: 'Beginner' },
    accessibilityNeeds: { type: String, default: '' },
    studyBackground: { type: String, default: '' },
    studyField: { type: String, default: '' },
    preferredLanguages: [{ type: String }],
    onboardingComplete: { type: Boolean, default: false },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
