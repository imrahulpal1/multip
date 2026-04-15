import { lazy, Suspense, useEffect, useState } from 'react'
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react'
import Sidebar from './components/layout/Sidebar'
import TopNavbar from './components/layout/TopNavbar'
import MobileNav from './components/layout/MobileNav'
import { useAppStore } from './hooks/useAppStore'
import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import CourseManagementPage from './pages/CourseManagementPage'
import PreferencesPage from './pages/PreferencesPage'
import AdminPage from './pages/AdminPage'
import AdminLoginPage from './pages/AdminLoginPage'
import SSOCallback from './pages/SSOCallback'
import { getUserRole } from './utils/roles'
import { authApi, setAuthToken } from './services/api'

const LectureAssistantPage = lazy(() => import('./pages/LectureAssistantPage'))
const LectureViewPage = lazy(() => import('./pages/LectureViewPage'))
const LectureTestPage = lazy(() => import('./pages/LectureTestPage'))
const AITutorPage = lazy(() => import('./pages/AITutorPage'))
const PeerLearningPage = lazy(() => import('./pages/PeerLearningPage'))
const GamificationPage = lazy(() => import('./pages/GamificationPage'))
const ProgressPage = lazy(() => import('./pages/ProgressPage'))

function RoleProtectedRoute({ role, allowedRoles, isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />
  return children
}

export default function App() {
  const { user } = useUser()
  const { isSignedIn } = useAuth()
  const {
    points, level, streak, notifications, theme, role,
    incrementTimeSpent, setRole, adminAuthenticated,
    setUserProfile, updatePreferences, onboardingComplete,
  } = useAppStore()

  const [onboardingChecked, setOnboardingChecked] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => incrementTimeSpent(1), 60000)
    return () => clearInterval(timer)
  }, [incrementTimeSpent])

  useEffect(() => {
    if (adminAuthenticated) { setRole('admin'); return }
    if (user) setRole(getUserRole(user))
  }, [adminAuthenticated, setRole, user])

  // Set clerk-based auth token for backend API calls
  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      setAuthToken(`clerk:${user.primaryEmailAddress.emailAddress}`)
    } else if (!adminAuthenticated) {
      setAuthToken(null)
    }
  }, [isSignedIn, user, adminAuthenticated])

  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      setOnboardingChecked(true)
      return
    }
    const email = user.primaryEmailAddress.emailAddress
    authApi.checkEmail(email)
      .then((res) => {
        if (res.exists && res.onboardingComplete) {
          setUserProfile(res.profile)
          updatePreferences({
            nativeLanguage: res.profile.preferredLanguage,
            targetLanguage: res.profile.targetLanguage,
            academicLevel: res.profile.academicLevel,
            preferredLanguages: res.profile.preferredLanguages || [],
            studyBackground: res.profile.studyBackground || '',
            studyField: res.profile.studyField || '',
          })
        } else if (res.exists && !res.onboardingComplete) {
          // backend says this user hasn't completed onboarding
          useAppStore.setState({ onboardingComplete: false })
        }
        setOnboardingChecked(true)
      })
      .catch(() => {
        // backend down — don't block the user, let them through
        setOnboardingChecked(true)
      })
  }, [user])

  const fallback = (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-6 text-sm text-slate-200 backdrop-blur-xl">
      Loading page...
    </div>
  )

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light' : 'theme-dark'}`}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sso-callback" element={<SSOCallback />} />

        <Route
          path="/admin"
          element={
            <RoleProtectedRoute role={role} allowedRoles={['admin']} isAuthenticated={adminAuthenticated}>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6">
                  <TopNavbar notifications={notifications} />
                  <MobileNav />
                  <AdminPage />
                </main>
              </div>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <>
              <SignedIn><OnboardingPage /></SignedIn>
              <SignedOut><Navigate to="/login" replace /></SignedOut>
            </>
          }
        />

        <Route
          path="*"
          element={
            <>
              <SignedIn>
                {!onboardingChecked ? (
                  <div className="flex min-h-screen items-center justify-center text-slate-300 text-sm">
                    Checking profile...
                  </div>
                ) : !onboardingComplete ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 p-4 md:p-6">
                      <TopNavbar notifications={notifications} />
                      <MobileNav />
                      <Suspense fallback={fallback}>
                        <Routes>
                          <Route path="/" element={<DashboardPage points={points} level={level} streak={streak} />} />
                          <Route
                            path="/lecture-assistant"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <LectureAssistantPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route
                            path="/lecture-view"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <LectureViewPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route
                            path="/lecture-test"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <LectureTestPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route
                            path="/ai-tutor"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <AITutorPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route
                            path="/peer-learning"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <PeerLearningPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route
                            path="/gamification"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['student']} isAuthenticated>
                                <GamificationPage points={points} />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route path="/progress" element={<ProgressPage />} />
                          <Route
                            path="/course-management"
                            element={
                              <RoleProtectedRoute role={role} allowedRoles={['admin']} isAuthenticated>
                                <CourseManagementPage />
                              </RoleProtectedRoute>
                            }
                          />
                          <Route path="/preferences" element={<PreferencesPage />} />
                          <Route path="/unauthorized" element={<UnauthorizedPage />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </main>
                  </div>
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  )
}
