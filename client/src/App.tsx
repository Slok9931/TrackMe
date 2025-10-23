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
      const response = await axios.get(`${config.API_BASE_URL}${config.API_ENDPOINTS.USER.PROFILE}`, {
        withCredentials: true
      })
      setUser(response.data)
    } catch (error) {
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
