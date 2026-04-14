export const navItems = [
  { id: 'dashboard', labelKey: 'dashboard', path: '/', roles: ['student', 'instructor', 'admin'] },
  { id: 'lecture', labelKey: 'lectureAssistant', path: '/lecture-assistant', roles: ['student'] },
  { id: 'tutor', labelKey: 'aiTutor', path: '/ai-tutor', roles: ['student'] },
  { id: 'peer', labelKey: 'peerLearning', path: '/peer-learning', roles: ['student'] },
  { id: 'gamification', labelKey: 'gamification', path: '/gamification', roles: ['student'] },
  { id: 'progress', labelKey: 'progress', path: '/progress', roles: ['student', 'instructor', 'admin'] },
  { id: 'courses', labelKey: 'courseManagement', path: '/course-management', roles: ['instructor', 'admin'] },
  { id: 'preferences', labelKey: 'preferences', path: '/preferences', roles: ['student', 'instructor', 'admin'] },
  { id: 'admin', labelKey: 'adminPanel', path: '/admin', roles: ['admin'] },
]

export const dashboardStats = [
  { title: 'Lessons Completed', value: '42', delta: '+8 this week' },
  { title: 'Languages Practiced', value: '5', delta: 'Spanish leading' },
  { title: 'Study Minutes', value: '1,280', delta: '+210 today' },
  { title: 'Peer Contributions', value: '24', delta: '+3 answers' },
]

export const leaderboard = [
  { name: 'Aarav', points: 2580, level: 'Fluent Explorer' },
  { name: 'Mina', points: 2410, level: 'Grammar Ninja' },
  { name: 'You', points: 2250, level: 'Vocabulary Pro' },
  { name: 'Ethan', points: 2110, level: 'Culture Scout' },
]

export const keyPoints = [
  'Contextual examples improve retention by 45%.',
  'Micro-practice after lecture boosts recall speed.',
  'Switching between listening and writing helps fluency.',
]

export const chatSeeds = [
  'Explain subjunctive mood with examples.',
  'Quiz me on everyday French phrases.',
  'Give me a roleplay for a job interview in German.',
]

export const peerQuestions = [
  {
    id: 1,
    title: 'How do you remember irregular Spanish verbs quickly?',
    tags: ['Spanish', 'Memory'],
    upvotes: 14,
    answer: 'Use grouped patterns and practice with sentence drills daily.',
  },
  {
    id: 2,
    title: 'Best method to improve Japanese listening comprehension?',
    tags: ['Japanese', 'Listening'],
    upvotes: 21,
    answer: 'Shadow short clips and repeat with transcripts at 0.75x speed.',
  },
  {
    id: 3,
    title: 'Any tips for sounding natural in French conversations?',
    tags: ['French', 'Speaking'],
    upvotes: 17,
    answer: 'Focus on connectors and fillers used by native speakers.',
  },
]

export const badges = [
  { title: '7-Day Streak', emoji: '🔥' },
  { title: 'Quiz Master', emoji: '🧠' },
  { title: 'Translator', emoji: '🌍' },
  { title: 'Community Helper', emoji: '🤝' },
]

export const dailyChallenges = [
  'Summarize one lecture in a new language.',
  'Answer two peer questions.',
  'Complete one AI tutor roleplay.',
]

export const progressData = [
  { day: 'Mon', vocabulary: 40, grammar: 35, speaking: 20 },
  { day: 'Tue', vocabulary: 55, grammar: 45, speaking: 30 },
  { day: 'Wed', vocabulary: 52, grammar: 48, speaking: 38 },
  { day: 'Thu', vocabulary: 68, grammar: 58, speaking: 42 },
  { day: 'Fri', vocabulary: 74, grammar: 63, speaking: 54 },
  { day: 'Sat', vocabulary: 78, grammar: 66, speaking: 58 },
  { day: 'Sun', vocabulary: 86, grammar: 74, speaking: 62 },
]

export const mockLecture = {
  title: 'Introduction to Contextual Language Acquisition',
  subject: 'Linguistics',
  language: 'Spanish',
  duration: '48 min',
  summary:
    'This lecture explores how contextual cues accelerate second-language acquisition. Learners exposed to real-world scenarios retain vocabulary 45% faster than rote memorization methods.',
  multilingualSummary: {
    Spanish:
      'Esta conferencia explora cómo las señales contextuales aceleran la adquisición de un segundo idioma.',
    French:
      "Cette conférence explore comment les indices contextuels accélèrent l'acquisition d'une deuxième langue.",
    German:
      'Diese Vorlesung untersucht, wie kontextuelle Hinweise den Zweitspracherwerb beschleunigen.',
  },
  keyTerms: [
    { term: 'Contextual Acquisition', definition: 'Learning language through real-world context rather than isolated rules.' },
    { term: 'Retention Rate', definition: 'The percentage of information retained after a learning session.' },
    { term: 'Micro-practice', definition: 'Short, frequent practice sessions that reinforce memory pathways.' },
    { term: 'Fluency Threshold', definition: 'The point at which a learner can communicate without conscious effort.' },
  ],
  flashcards: [
    { q: 'What is contextual acquisition?', a: 'Learning through real-world context.' },
    { q: 'How much faster is contextual learning?', a: '45% faster than rote memorization.' },
    { q: 'What is micro-practice?', a: 'Short, frequent sessions to reinforce memory.' },
  ],
  quiz: [
    {
      question: 'Contextual learning improves retention by approximately:',
      options: ['15%', '30%', '45%', '60%'],
      answer: 2,
    },
    {
      question: 'Micro-practice sessions are best described as:',
      options: ['Long daily sessions', 'Short frequent sessions', 'Weekly reviews', 'Passive listening'],
      answer: 1,
    },
  ],
}

export const timeline = [
  'Completed lecture summary in Spanish.',
  'Unlocked Quiz Master badge.',
  'Joined peer thread about pronunciation drills.',
  'Reached level 12 with 2250 points.',
]
