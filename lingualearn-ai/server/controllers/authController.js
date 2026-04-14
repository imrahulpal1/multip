import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signToken } from '../utils/token.js'

export const signup = async (req, res) => {
  const { name, email, password, role = 'student' } = req.body
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) return res.status(400).json({ message: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, passwordHash, role: role === 'admin' ? 'admin' : 'student' })
  const token = signToken({ id: user._id, role: user.role, email: user.email })
  return res.status(201).json({ token, user })
}

export const login = async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = signToken({ id: user._id, role: user.role, email: user.email })
  return res.json({ token, user })
}

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash')
  return res.json(user)
}

// Check if a user with this email has completed onboarding
export const checkEmail = async (req, res) => {
  const { email } = req.query
  if (!email) return res.status(400).json({ message: 'Email required' })
  const user = await User.findOne({ email: email.toLowerCase() }).select('onboardingComplete preferredLanguages targetLanguage academicLevel studyBackground studyField')
  if (!user) return res.json({ exists: false })
  return res.json({ exists: true, onboardingComplete: user.onboardingComplete, profile: user })
}

export const saveProfile = async (req, res) => {
  const {
    email, name,
    studyBackground, studyField,
    preferredLanguages, targetLanguage,
    academicLevel, nativeLanguage,
    age, phone,
  } = req.body

  if (!email) return res.status(400).json({ message: 'Email required' })

  const update = {
    name, studyBackground, studyField,
    preferredLanguages: preferredLanguages || [],
    targetLanguage, preferredLanguage: nativeLanguage,
    academicLevel, age, phone,
    onboardingComplete: true,
  }

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).select('-passwordHash')

  return res.json(user)
}

export const updatePreferences = async (req, res) => {
  const payload = {
    preferredLanguage: req.body.preferredLanguage,
    targetLanguage: req.body.targetLanguage,
    academicLevel: req.body.academicLevel,
    accessibilityNeeds: req.body.accessibilityNeeds,
    preferredLanguages: req.body.preferredLanguages,
    studyBackground: req.body.studyBackground,
    studyField: req.body.studyField,
  }
  const user = await User.findByIdAndUpdate(req.user.id, payload, { new: true }).select('-passwordHash')
  return res.json(user)
}
