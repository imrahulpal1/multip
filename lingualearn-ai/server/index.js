/* global process */
import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import courseRoutes from './routes/courseRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import gamificationRoutes from './routes/gamificationRoutes.js'
import discussionRoutes from './routes/discussionRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { seedCoursesIfEmpty } from './utils/seedCourses.js'
import { seedAdminIfMissing } from './utils/seedAdmin.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: '*' },
})

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api', gamificationRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/admin', adminRoutes)

io.on('connection', (socket) => {
  socket.on('chat:message', (payload) => {
    io.emit('chat:message', payload)
  })
  socket.on('leaderboard:update', (payload) => {
    io.emit('leaderboard:update', payload)
  })
})

const PORT = process.env.PORT || 8080
connectDB()
  .then(seedCoursesIfEmpty)
  .then(seedAdminIfMissing)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`LinguaLearn backend running on http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Server failed to start', error)
    process.exit(1)
  })
