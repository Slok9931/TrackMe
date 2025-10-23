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
            await apiClient.post(config.API_ENDPOINTS.AUTH.LOGOUT)
            // Clear the token from localStorage
            localStorage.removeItem('authToken')
            setUser(null)
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
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
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/dsa" className="flex items-center space-x-3">
                            <img
                                src="/check.jpg"
                                alt="TrackMe Logo"
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-gray-900">TrackMe</span>
                                <span className="text-xs text-gray-500 -mt-1">DSA Tracker</span>
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
                                    ? 'bg-green-100 text-green-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <img
                                    src={user.profilePicture || '/default-avatar.png'}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=059669&color=fff`
                                    }}
                                />
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                    <div className="md:hidden border-t border-gray-200 py-2">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${isActivePath(link.path)
                                        ? 'bg-green-100 text-green-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
