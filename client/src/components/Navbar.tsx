import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apiClient, config } from '../config/api'

interface User {
    _id: string
    name: string
    email: string
    googleId: string
    profilePicture?: string
}

interface NavbarProps {
    user: User
    setUser: (user: User | null) => void
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            // Call logout endpoint to clear server-side session/token
            await apiClient.post(config.API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
            console.error('Logout error:', error)
            // Continue with logout even if server call fails
        } finally {
            // Clear the token from localStorage
            localStorage.removeItem('authToken')
            // Clear user state
            setUser(null)
            // Navigate to login page
            navigate('/')
        }
    }

    const isActivePath = (path: string) => {
        return location.pathname === path
    }

    const navLinks = [
        { path: '/dsa', label: 'Dashboard', icon: '📊' },
        { path: '/dsa/problems', label: 'Problems', icon: '🧩' },
        { path: '/dsa/add', label: 'Add Problem', icon: '➕' }
    ]

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,6,23,0.5)]">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/dsa" className="flex items-center space-x-3 group">
                            <img
                                src="/check.jpg"
                                alt="TrackMe Logo"
                                className="h-12 w-12 rounded-xl object-cover border border-white/20 shadow-lg"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-amber-200 group-hover:text-amber-100 transition-colors">TrackMe</span>
                                <span className="text-xs text-slate-400 -mt-1">DSA Tracker</span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActivePath(link.path)
                                    ? 'bg-amber-300 text-slate-950 shadow-[0_10px_25px_rgba(251,191,36,0.25)]'
                                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Profile Section */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <img
                                    src={user.profilePicture || '/default-avatar.png'}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full object-cover border border-amber-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=111827`
                                    }}
                                />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-slate-900/95 py-1 z-50 shadow-[0_22px_60px_rgba(2,6,23,0.7)] backdrop-blur-xl">
                                        <div className="px-4 py-3 border-b border-white/10">
                                            <p className="text-sm font-medium text-slate-100">{user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                                        >
                                            <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false)
                                                handleLogout()
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-300 hover:bg-red-500/15"
                                        >
                                            <svg className="mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 py-2">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${isActivePath(link.path)
                                        ? 'bg-amber-300 text-slate-950'
                                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <span className="mr-3">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
