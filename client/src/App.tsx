import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { config } from './config/api'
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
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Store token and clear URL
        localStorage.setItem('authToken', token);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Try token-based auth first
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const tokenResponse = await axios.get(`${config.API_BASE_URL}/auth/token/${storedToken}`);
          console.log('Token auth response:', tokenResponse.data);
          if (tokenResponse.data.authenticated) {
            setUser(tokenResponse.data.user);
            return;
          }
        } catch (tokenError) {
          console.log('Token auth failed, clearing token');
          localStorage.removeItem('authToken');
        }
      }
      
      // Fallback to session-based auth
      const authResponse = await axios.get(`${config.API_BASE_URL}/auth/check`, {
        withCredentials: true
      })
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
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
