import { Router } from 'express'
import { addCourse, deleteCourse, getCourses, updateCourse } from '../controllers/courseController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.get('/', getCourses)
router.post('/', requireAuth, requireRole('admin'), addCourse)
router.put('/:id', requireAuth, requireRole('admin'), updateCourse)
router.delete('/:id', requireAuth, requireRole('admin'), deleteCourse)

export default router
