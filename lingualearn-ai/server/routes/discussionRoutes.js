import { Router } from 'express'
import {
  approveDiscussion,
  createDiscussion,
  listDiscussions,
  replyDiscussion,
  upvoteDiscussion,
} from '../controllers/discussionController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.get('/', listDiscussions)
router.post('/', requireAuth, createDiscussion)
router.post('/:id/reply', requireAuth, replyDiscussion)
router.post('/:id/upvote', requireAuth, upvoteDiscussion)
router.patch('/:id/approve', requireAuth, requireRole('admin'), approveDiscussion)

export default router
