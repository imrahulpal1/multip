import Course from '../models/Course.js'

export const getCourses = async (_req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 })
  res.json(courses)
}

export const addCourse = async (req, res) => {
  const course = await Course.create(req.body)
  res.status(201).json(course)
}

export const updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(course)
}

export const deleteCourse = async (req, res) => {
  await Course.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
}
