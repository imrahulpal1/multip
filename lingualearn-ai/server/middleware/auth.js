/* global process */
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  // 1. Try standard JWT first
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret')
    return next()
  } catch {
    // not a JWT — fall through to Clerk email token
  }

  // 2. Clerk sends email as token (set by frontend as "clerk:<email>")
  if (token.startsWith('clerk:')) {
    const email = token.slice(6).toLowerCase()
    try {
      let user = await User.findOne({ email })
      if (!user) {
        try {
          user = await User.create({ name: email.split('@')[0], email, role: 'student' })
        } catch {
          // race condition — another request already created it
          user = await User.findOne({ email })
        }
      }
      if (!user) return res.status(401).json({ message: 'Auth failed' })
      req.user = { id: user._id, role: user.role, email: user.email }
      return next()
    } catch (err) {
      return res.status(401).json({ message: 'Auth failed', error: err.message })
    }
  }

  return res.status(401).json({ message: 'Invalid token' })
}

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ message: 'Forbidden' })
  return next()
}
