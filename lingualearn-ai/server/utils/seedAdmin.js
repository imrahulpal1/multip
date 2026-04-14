/* global process */
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

export const seedAdminIfMissing = async () => {
  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'admin@123'
  const existing = await User.findOne({ email })
  if (existing) return
  const passwordHash = await bcrypt.hash(password, 10)
  await User.create({
    name: 'Platform Admin',
    email,
    passwordHash,
    role: 'admin',
    preferredLanguage: 'English',
  })
  console.log('Default admin seeded:', email)
}
