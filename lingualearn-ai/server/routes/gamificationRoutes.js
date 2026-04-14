import { Router } from 'express'
import { getLeaderboard } from '../controllers/gamificationController.js'

const router = Router()
router.get('/leaderboard', getLeaderboard)

export default router
