import { Router } from 'express'
import { login, me, signup, updatePreferences } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.post('/signup', signup)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.patch('/preferences', requireAuth, updatePreferences)

export default router
