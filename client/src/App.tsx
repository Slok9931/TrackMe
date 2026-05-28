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
import NotFoundPage from './components/NotFoundPage.tsx'
import { Navbar } from './components/ui/TopNavbar.tsx'
import { Footer } from './components/ui/footer'
import PrivacyPolicy from './components/PrivacyPolicy.tsx'
import Terms from './components/Terms.tsx'
import './App.css'
import { LoadingState } from './components/ui/loading-state.tsx'

interface User {
  _id: string
  name: string
  email: string
  googleId: string
  profilePicture?: string
  createdAt: string
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
          if (tokenResponse.data.authenticated) {
            setUser(tokenResponse.data.user)
            return
          }
        } catch (tokenError) {
          localStorage.removeItem('authToken')
        }
      }

      // Fallback to session-based auth
      const authResponse = await apiClient.get('/auth/check')

      if (authResponse.data.authenticated) {
        setUser(authResponse.data.user)
      }
    } catch (error) {
      
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message='Checking authentication status...' />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[#07111f] text-slate-50 flex flex-col">
          {user && <Navbar user={user} setUser={setUser} />}
          <div className="flex-1">
            <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dsa" /> : <LoginPage />}
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
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
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          {user && <Footer />}
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
