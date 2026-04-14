/* global process */
import jwt from 'jsonwebtoken'

export const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '7d' })
