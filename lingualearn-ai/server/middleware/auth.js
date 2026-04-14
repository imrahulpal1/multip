/* global process */
import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret')
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).json({ message: 'Forbidden' })
  return next()
}
