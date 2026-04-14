import { Router } from 'express'
import { getAnalytics, getUsers } from '../controllers/adminController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/users', requireAuth, requireRole('admin'), getUsers)
router.get('/analytics', requireAuth, requireRole('admin'), getAnalytics)

export default router
