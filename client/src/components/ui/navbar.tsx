import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    BarChart3,
    Menu,
    LogOut,
    PlusCircle,
    Puzzle,
    User,
    type LucideIcon,
} from 'lucide-react'
import { apiClient, config } from '../../config/api'

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

interface NavLinkItem {
    path: string
    label: string
    icon: LucideIcon
}

export const Navbar: React.FC<NavbarProps> = ({ user, setUser }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await apiClient.get(config.API_ENDPOINTS.AUTH.LOGOUT)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('authToken')
            setUser(null)
            navigate('/')
        }
    }

    const isActivePath = (path: string) => {
        return location.pathname === path
    }

    const navLinks: NavLinkItem[] = [
        { path: '/dsa', label: 'Dashboard', icon: BarChart3 },
        { path: '/dsa/problems', label: 'Problems', icon: Puzzle },
        { path: '/dsa/add', label: 'Add Problem', icon: PlusCircle }
    ]

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_12px_40px_rgba(2,6,23,0.5)]">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/dsa" className="group flex items-center -space-x-6">
                            <img
                                src="/logo.png"
                                alt="TrackMe Logo"
                                className="h-20"
                            />
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-amber-200 transition-colors group-hover:text-amber-100">TrackMe</span>
                                <span className="-mt-1 text-xs text-slate-400">DSA Tracker</span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden items-center space-x-1 md:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActivePath(link.path)
                                    ? 'bg-amber-300 text-slate-950 shadow-[0_10px_25px_rgba(251,191,36,0.25)]'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="rounded-md p-2 text-slate-300 hover:bg-white/10 hover:text-white md:hidden"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-white/10"
                            >
                                <img
                                    src={user.profilePicture || '/default-avatar.png'}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full border border-amber-300 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f59e0b&color=111827`
                                    }}
                                />
                            </button>

                            {isProfileMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-white/15 bg-slate-900/95 py-1 shadow-[0_22px_60px_rgba(2,6,23,0.7)] backdrop-blur-xl">
                                        <div className="border-b border-white/10 px-4 py-3">
                                            <p className="text-sm font-medium text-slate-100">{user.name}</p>
                                            <p className="truncate text-xs text-slate-400">{user.email}</p>
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
                                        >
                                            <User className="mr-3 h-4 w-4" />
                                            Profile Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false)
                                                handleLogout()
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-300 hover:bg-red-500/15"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="border-t border-white/10 py-2 md:hidden">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`mx-2 flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActivePath(link.path)
                                        ? 'bg-amber-300 text-slate-950'
                                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <link.icon className="mr-3 h-4 w-4" />
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
