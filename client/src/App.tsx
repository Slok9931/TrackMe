import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { apiClient } from './config/api'
import LoginPage from './components/LoginPage.tsx'
import ProfilePage from './components/ProfilePage.tsx'
import DSADashboard from './components/DSADashboard.tsx'
import ProblemsList from './components/ProblemsList.tsx'
import AddProblem from './components/AddProblem.tsx'
import ProblemDetail from './components/ProblemDetail.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import Navbar from './components/Navbar.tsx'
import './App.css'

interface User {
  _id: string
  name: string
  email: string
  googleId: string
  profilePicture?: string
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check for token in URL (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')

      if (token) {
        // Store token and clear URL
        localStorage.setItem('authToken', token)
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      // Try token-based auth first
      const storedToken = localStorage.getItem('authToken')
      if (storedToken) {
        try {
          const tokenResponse = await apiClient.get(`/auth/token/${storedToken}`)
          console.log('Token auth response:', tokenResponse.data)
          if (tokenResponse.data.authenticated) {
            setUser(tokenResponse.data.user)
            return
          }
        } catch (tokenError) {
          console.log('Token auth failed, clearing token')
          localStorage.removeItem('authToken')
        }
      }

      // Fallback to session-based auth
      const authResponse = await apiClient.get('/auth/check')
      console.log('Session auth response:', authResponse.data)

      if (authResponse.data.authenticated) {
        setUser(authResponse.data.user)
      }
    } catch (error) {
      console.log('Auth check failed:', error)
      console.log('User not authenticated')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-slate-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(135deg,_#07111f_0%,_#0b1727_45%,_#101b2e_100%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 px-8 py-7 backdrop-blur-xl shadow-[0_24px_70px_rgba(2,6,23,0.65)]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-4 h-4 bg-amber-300 rounded-full animate-pulse animation-delay-400"></div>
          </div>
          <p className="text-sm tracking-wide text-slate-300">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#07111f] text-slate-50">
          {user && <Navbar user={user} setUser={setUser} />}
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dsa" /> : <LoginPage />}
            />
            <Route
              path="/profile"
              element={user ? <ProfilePage user={user} setUser={setUser} /> : <Navigate to="/" />}
            />
            <Route
              path="/dsa"
              element={user ? <DSADashboard user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/dsa/problems"
              element={user ? <ProblemsList /> : <Navigate to="/" />}
            />
            <Route
              path="/dsa/add"
              element={user ? <AddProblem /> : <Navigate to="/" />}
            />
            <Route
              path="/dsa/problems/:id"
              element={user ? <ProblemDetail /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
