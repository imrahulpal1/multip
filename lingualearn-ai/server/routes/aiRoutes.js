import { Router } from 'express'
import { chat, explain, summarize } from '../controllers/aiController.js'

const router = Router()
router.post('/chat', chat)
router.post('/summarize', summarize)
router.post('/explain', explain)

export default router
