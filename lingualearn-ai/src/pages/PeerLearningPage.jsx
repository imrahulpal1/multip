import { useCallback, useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { translateForumText } from '../utils/learningEngines'
import { forumApi } from '../services/api'

export default function PeerLearningPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [questionLanguage, setQuestionLanguage] = useState('Hindi')
  const [replyText, setReplyText] = useState({})
  const { preferences, completeChallenge } = useAppStore()
  const [forumThreads, setForumThreads] = useState([])
  const viewerLanguage = preferences.nativeLanguage || 'English'

  const loadThreads = useCallback(async () => {
    const data = await forumApi.list(viewerLanguage)
    setForumThreads(data)
  }, [viewerLanguage])

  useEffect(() => {
    const run = async () => {
      await loadThreads().catch(() => {})
    }
    setTimeout(run, 0)
  }, [loadThreads])

  const handlePost = async () => {
    if (!title.trim()) return
    await forumApi.create({ title, content: body, language: questionLanguage })
    setTitle('')
    setBody('')
    setQuestionLanguage('Hindi')
    setIsOpen(false)
    await loadThreads()
  }

  return (
    <div className="space-y-5">
      <Card title="Peer Learning Hub" subtitle="Learn with and from your community">
        <div className="mb-3 flex justify-end">
          <Button onClick={() => setIsOpen(true)}>Ask Question</Button>
        </div>
        <div className="space-y-3">
          {forumThreads.map((q) => (
            <div key={q._id || q.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">
                    {translateForumText(q.title, q.language, viewerLanguage)}
                  </p>
                  <p className="text-xs text-slate-300">
                    Original language: {q.language} · Viewer language: {viewerLanguage}
                  </p>
                </div>
                <button
                  onClick={() => {
                    forumApi.upvote(q._id).then(loadThreads)
                    completeChallenge('w1')
                  }}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100"
                >
                  👍 {q.upvotes}
                </button>
              </div>
              <p className="mt-3 rounded-lg bg-slate-800/60 p-3 text-sm text-slate-200">
                {translateForumText(q.content || q.body || 'No description provided.', q.language, viewerLanguage)}
              </p>
              <div className="mt-3 space-y-2">
                {(q.replies || []).map((reply) => (
                  <div key={reply._id || reply.id} className="rounded-lg bg-slate-800/60 p-2 text-sm text-slate-200">
                    {translateForumText(reply.content || reply.text, reply.language, viewerLanguage)}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={replyText[q._id || q.id] || ''}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [q._id || q.id]: e.target.value }))}
                  placeholder="Reply in your language..."
                  className="w-full rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm"
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (!(replyText[q._id || q.id] || '').trim()) return
                    forumApi
                      .reply(q._id, { content: replyText[q._id || q.id], language: viewerLanguage })
                      .then(loadThreads)
                    setReplyText((prev) => ({ ...prev, [q._id || q.id]: '' }))
                    completeChallenge('w1')
                  }}
                >
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {isOpen && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5">
            <h3 className="text-lg font-semibold text-white">Ask a New Question</h3>
            <select
              value={questionLanguage}
              onChange={(e) => setQuestionLanguage(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm"
            >
              <option>Hindi</option>
              <option>Spanish</option>
              <option>French</option>
              <option>English</option>
            </select>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Question title"
              className="mt-4 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe your question..."
              className="mt-3 h-28 w-full rounded-xl border border-white/10 bg-slate-800 p-3 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePost}>Post Question</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
