# LinguaLearn AI

Hackathon-ready full-stack starter for a context-aware multilingual learning platform with gamification.

## Tech Stack

- React + Vite
- Tailwind CSS
- Zustand (lightweight state)
- Recharts (progress analytics)
- Lucide React icons
- React Router DOM (route navigation)
- Axios (API integration scaffold)
- Clerk Authentication (Google + OTP/email verification)
- Express + Prisma + SQLite (user profile storage)

## Project Structure

```text
src/
  components/
    layout/
      Sidebar.jsx
      TopNavbar.jsx
      MobileNav.jsx
    ui/
      Badge.jsx
      Button.jsx
      Card.jsx
      ProgressBar.jsx
      StatCard.jsx
  hooks/
    useAppStore.js
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    OnboardingPage.jsx
    DashboardPage.jsx
    LectureAssistantPage.jsx
    AITutorPage.jsx
    PeerLearningPage.jsx
    GamificationPage.jsx
    ProgressPage.jsx
  utils/
    api.js
    httpClient.js
    mockData.js
server/
  index.js
prisma/
  schema.prisma
  App.jsx
  index.css
  main.jsx
```

## Features Included

- Sidebar + top navbar app layout
- Dashboard with points, level progress, streak, stats, leaderboard
- Lecture Assistant with upload placeholder, actions, and output sections
- AI Tutor chat UI with suggested prompts
- Peer Learning with upvote UI and Ask Question modal
- Gamification area with badges, leaderboard, daily challenges
- Progress dashboard with charts, skill bars, and activity timeline
- Reusable UI components for scalable development
- Mock API service ready for real backend integration
- Route-based navigation for direct deep-linking
- Theme toggle (dark/light) from navbar
- Interactive auth pages with animated gradient background
- Clerk-powered login and registration routes
- Onboarding page to collect name, email/number, age, study level, target language
- User profile persistence in SQLite via backend API

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Set `VITE_CLERK_PUBLISHABLE_KEY` with your Clerk key.

3. Start frontend + backend together:

```bash
npm run dev:full
```

4. Build production bundle:

```bash
npm run build
```

5. Run database migration (already done once in this repo, run again if schema changes):

```bash
npm run db:migrate
```

## Future Integration Notes

- Add Clerk webhook verification on backend before accepting profile writes.
- Add JWT verification for protected backend API routes.
- Expand `UserProfile` model with learning goals and language proficiency history.
