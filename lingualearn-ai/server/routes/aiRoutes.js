import { Router } from 'express'
import { chat, explain, summarize, processFile, generateTest, analyzeLecture } from '../controllers/aiController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.post('/chat', chat)
router.post('/summarize', summarize)
router.post('/explain', explain)
router.post('/process-file', processFile)
router.post('/generate-test', generateTest)
router.post('/analyze-lecture', analyzeLecture)

export default router
