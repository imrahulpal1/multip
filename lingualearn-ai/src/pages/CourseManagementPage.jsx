import { useEffect, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { courseApi } from '../services/api'

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    title: '',
    level: 'Beginner',
    modules: 1,
    videos: 0,
    readings: 0,
  })
  const [editId, setEditId] = useState('')

  const loadCourses = async () => {
    const data = await courseApi.list()
    setCourses(data)
  }

  useEffect(() => {
    const run = async () => {
      await loadCourses().catch(() => {})
    }
    setTimeout(run, 0)
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title,
      level: form.level,
      modules: [
        { title: `${form.title} - Module 1`, topics: [{ name: 'Topic 1' }] },
        { title: `${form.title} - Module 2`, topics: [{ name: 'Topic 2' }] },
      ],
    }
    if (editId) {
      await courseApi.update(editId, payload)
    } else {
      await courseApi.create(payload)
    }
    await loadCourses()
    setEditId('')
    setForm({ title: '', level: 'Beginner', modules: 1, videos: 0, readings: 0 })
  }

  return (
    <div className="space-y-5">
      <Card title="Course Management" subtitle="Upload syllabus, modules, videos, and readings">
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            placeholder="Course title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
          <select
            value={form.level}
            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <input
            type="number"
            min="1"
            className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            placeholder="Modules"
            value={form.modules}
            onChange={(e) => setForm((p) => ({ ...p, modules: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            placeholder="Videos"
            value={form.videos}
            onChange={(e) => setForm((p) => ({ ...p, videos: e.target.value }))}
          />
          <input
            type="number"
            min="0"
            className="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
            placeholder="Readings"
            value={form.readings}
            onChange={(e) => setForm((p) => ({ ...p, readings: e.target.value }))}
          />
          <label className="rounded-xl border border-dashed border-white/30 bg-slate-900/40 px-3 py-2 text-sm text-slate-200">
            Upload syllabus/media (placeholder)
            <input type="file" className="mt-2 block w-full text-xs" />
          </label>
          <div className="md:col-span-2">
            <Button type="submit">{editId ? 'Update Course' : 'Create Course'}</Button>
          </div>
        </form>
      </Card>

      <Card title="Published Courses">
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course._id} className="rounded-xl bg-slate-900/40 p-4">
              <p className="font-semibold text-white">{course.title}</p>
              <p className="text-sm text-slate-300">
                {course.level} · {course.modules?.length || 0} modules
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditId(course._id)
                    setForm((p) => ({ ...p, title: course.title, level: course.level }))
                  }}
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => courseApi.remove(course._id).then(loadCourses)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
