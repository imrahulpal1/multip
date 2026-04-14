import { create } from 'zustand'
import { getAdaptivePath } from '../utils/learningEngines'

const initialAdminAuth =
  typeof window !== 'undefined' && window.localStorage.getItem('lingualearn-admin-auth') === 'true'

export const useAppStore = create((set) => ({
  points: 2250,
  level: 12,
  streak: 9,
  notifications: 3,
  theme: 'dark',
  role: 'student',
  adminAuthenticated: initialAdminAuth,
  language: 'en',
  timeSpentMinutes: 42,
  moduleProgress: [
    { id: 'm1', title: 'Introduction to Grammar', completed: true },
    { id: 'm2', title: 'Contextual Vocabulary', completed: true },
    { id: 'm3', title: 'Listening Practice', completed: false },
    { id: 'm4', title: 'Speaking Lab', completed: false },
  ],
  courses: [
    {
      id: 'c1',
      title: 'Spanish A1 Foundations',
      level: 'Beginner',
      modules: 8,
      videos: 12,
      readings: 5,
    },
  ],
  preferences: {
    nativeLanguage: 'English',
    targetLanguage: 'Spanish',
    academicLevel: 'Beginner',
    accessibilityNeeds: 'High contrast',
    preferredLanguages: ['Spanish'],
    studyBackground: '',
    studyField: '',
  },
  userProfile: null,
  onboardingComplete: true,
  lectureHistory: [],
  mistakeBank: [],
  performance: {
    averageScore: 72,
    recentQuizScores: [68, 75, 73],
  },
  forumThreads: [
    {
      id: 'f1',
      language: 'Hindi',
      title: 'संज्ञा और सर्वनाम में क्या अंतर है?',
      body: 'कृपया आसान उदाहरण के साथ समझाएं।',
      upvotes: 8,
      replies: [{ id: 'r1', language: 'Spanish', text: 'Un sustantivo nombra cosas y un pronombre lo reemplaza.' }],
    },
  ],
  badges: ['7-Day Streak', 'Quiz Master'],
  leaderboard: [
    { name: 'Aarav', points: 2580 },
    { name: 'Mina', points: 2410 },
    { name: 'You', points: 2250 },
  ],
  challenges: [
    { id: 'd1', scope: 'Daily', title: 'Complete one extra reading module', completed: false, reward: 40 },
    { id: 'w1', scope: 'Weekly', title: 'Help 3 peers this week', completed: false, reward: 120 },
  ],
  setTheme: (theme) => set({ theme }),
  setRole: (role) => set({ role }),
  setAdminAuthenticated: (isAuthenticated) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lingualearn-admin-auth', isAuthenticated ? 'true' : 'false')
    }
    set({ adminAuthenticated: isAuthenticated })
  },
  setLanguage: (language) => set({ language }),
  incrementTimeSpent: (delta = 1) =>
    set((state) => ({ timeSpentMinutes: state.timeSpentMinutes + delta })),
  toggleModuleComplete: (moduleId) =>
    set((state) => ({
      moduleProgress: state.moduleProgress.map((module) =>
        module.id === moduleId ? { ...module, completed: !module.completed } : module,
      ),
    })),
  recordQuizScore: (score) =>
    set((state) => {
      const nextScores = [...state.performance.recentQuizScores, score].slice(-6)
      const avg = Math.round(nextScores.reduce((sum, item) => sum + item, 0) / nextScores.length)
      return {
        performance: {
          averageScore: avg,
          recentQuizScores: nextScores,
        },
      }
    }),
  addForumThread: (thread) =>
    set((state) => ({
      forumThreads: [{ id: `f${state.forumThreads.length + 1}`, upvotes: 0, replies: [], ...thread }, ...state.forumThreads],
    })),
  addForumReply: (threadId, reply) =>
    set((state) => ({
      forumThreads: state.forumThreads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              replies: [...thread.replies, { id: `r${thread.replies.length + 1}`, ...reply }],
            }
          : thread,
      ),
    })),
  upvoteThread: (threadId) =>
    set((state) => ({
      forumThreads: state.forumThreads.map((thread) =>
        thread.id === threadId ? { ...thread, upvotes: thread.upvotes + 1 } : thread,
      ),
      points: state.points + 5,
    })),
  completeChallenge: (challengeId) =>
    set((state) => {
      const challenge = state.challenges.find((item) => item.id === challengeId)
      if (!challenge || challenge.completed) return state
      const updatedChallenges = state.challenges.map((item) =>
        item.id === challengeId ? { ...item, completed: true } : item,
      )
      const newPoints = state.points + challenge.reward
      const newBadges =
        newPoints >= 2500 && !state.badges.includes('Milestone 2500')
          ? [...state.badges, 'Milestone 2500']
          : state.badges
      return {
        challenges: updatedChallenges,
        points: newPoints,
        badges: newBadges,
      }
    }),
  addCourse: (course) =>
    set((state) => ({
      courses: [...state.courses, { ...course, id: `c${state.courses.length + 1}` }],
    })),
  setUserProfile: (profile) =>
    set((state) => ({
      userProfile: profile,
      onboardingComplete: true,
      preferences: {
        ...state.preferences,
        nativeLanguage: profile.preferredLanguage || state.preferences.nativeLanguage,
        targetLanguage: profile.targetLanguage || state.preferences.targetLanguage,
        academicLevel: profile.academicLevel || state.preferences.academicLevel,
        preferredLanguages: profile.preferredLanguages?.length ? profile.preferredLanguages : state.preferences.preferredLanguages,
        studyBackground: profile.studyBackground || '',
        studyField: profile.studyField || '',
      },
    })),
  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    })),
  incrementPoints: (delta) => set((state) => ({ points: state.points + delta })),
  addLectureHistory: (lecture) =>
    set((state) => ({
      lectureHistory: [{ ...lecture, id: Date.now(), date: new Date().toISOString() }, ...state.lectureHistory].slice(0, 20),
    })),
  addMistakes: (mistakes) =>
    set((state) => {
      const updated = [...state.mistakeBank]
      mistakes.forEach((m) => {
        const existing = updated.findIndex((x) => x.topic === m.topic)
        if (existing >= 0) {
          updated[existing] = { ...updated[existing], count: updated[existing].count + 1, lastSeen: new Date().toISOString() }
        } else {
          updated.push({ topic: m.topic, question: m.question, wrongAnswer: m.wrongAnswer, correctAnswer: m.correctAnswer, count: 1, lastSeen: new Date().toISOString() })
        }
      })
      return { mistakeBank: updated }
    }),
  recordTestResult: (result) =>
    set((state) => ({
      points: state.points + result.pointsEarned,
      performance: {
        averageScore: Math.round((state.performance.averageScore + result.score) / 2),
        recentQuizScores: [...state.performance.recentQuizScores, result.score].slice(-6),
      },
    })),
  getAdaptivePathForUser: () =>
    getAdaptivePath({
      averageScore: useAppStore.getState().performance.averageScore,
      courseLevel: useAppStore.getState().preferences.academicLevel,
    }),
}))
