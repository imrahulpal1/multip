import Course from '../models/Course.js'

const cseCourses = [
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management Systems',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Software Engineering',
  'Compiler Design',
  'Theory of Computation',
  'Cyber Security',
]

export const seedCoursesIfEmpty = async () => {
  const count = await Course.countDocuments()
  if (count > 0) return

  const docs = cseCourses.map((title) => ({
    title,
    description: `${title} fundamentals for CSE track`,
    level: 'Intermediate',
    modules: [
      {
        title: `${title} - Module 1`,
        topics: [{ name: 'Core concepts' }, { name: 'Practice quiz' }],
      },
      {
        title: `${title} - Module 2`,
        topics: [{ name: 'Advanced use cases' }, { name: 'Case study' }],
      },
    ],
  }))

  await Course.insertMany(docs)
}
