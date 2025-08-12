import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from './contexts/AuthContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import WorkoutsPage from './pages/WorkoutsPage'
import WorkoutDetailPage from './pages/WorkoutDetailPage'
import GenerateWorkoutPage from './pages/GenerateWorkoutPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <WorkoutProvider>
          <Router>
            <div className="min-h-screen bg-background flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/workouts" element={
                    <ProtectedRoute>
                      <WorkoutsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/workouts/:id" element={
                    <ProtectedRoute>
                      <WorkoutDetailPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/generate" element={
                    <ProtectedRoute>
                      <GenerateWorkoutPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <Toaster position="top-right" />
            </div>
          </Router>
        </WorkoutProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

