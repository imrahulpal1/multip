import Course from '../models/Course.js'
import Discussion from '../models/Discussion.js'
import User from '../models/User.js'

export const getUsers = async (_req, res) => {
  const users = await User.find({}, 'name email role points preferredLanguage academicLevel').sort({ createdAt: -1 })
  res.json(users)
}

export const getAnalytics = async (_req, res) => {
  const [totalUsers, totalCourses, totalDiscussions, pendingDiscussions] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Discussion.countDocuments(),
    Discussion.countDocuments({ approved: false }),
  ])
  res.json({ totalUsers, totalCourses, totalDiscussions, pendingDiscussions })
}
