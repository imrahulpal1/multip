import { Router } from 'express'
import { login, me, signup, updatePreferences, checkEmail, saveProfile } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.post('/signup', signup)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.patch('/preferences', requireAuth, updatePreferences)
router.get('/check-email', checkEmail)
router.post('/save-profile', saveProfile)

export default router
