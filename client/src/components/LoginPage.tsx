import React from 'react'
import { config } from '../config/api'
import { Button } from './ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx'

const LoginPage: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.GOOGLE}`
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left side - Hero section */}
            <div className="flex-1 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/10 rounded-full"></div>
                </div>

                <div className="relative z-10 flex flex-col justify-center h-full p-8 lg:p-16 text-white">
                    <div className="max-w-lg">
                        <div className="flex items-center mb-8">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                                <img src='./check.jpg' />
                            </div>
                            <h1 className="text-3xl font-bold">TrackMe</h1>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                            Master Data Structures & Algorithms
                        </h2>

                        <p className="text-xl text-green-100 mb-8 leading-relaxed">
                            Track your progress, organize your practice, and ace your coding interviews with our comprehensive DSA tracking platform.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-green-100">Track problem-solving progress</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-green-100">Organize by difficulty & topics</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="text-green-100">Schedule revision sessions</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome Back
                        </h2>
                        <p className="text-gray-600">
                            Sign in to continue your DSA journey
                        </p>
                    </div>

                    {/* Login Card */}
                    <Card className="bg-white shadow-xl border-0">
                        <CardHeader className="text-center pb-8">
                            <CardTitle className="text-2xl font-semibold text-gray-900 mb-2">
                                Sign In
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Use your Google account to get started
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <Button
                                onClick={handleGoogleLogin}
                                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 py-6 text-base font-medium shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200"
                                size="lg"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Secure & trusted authentication
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-gray-500">
                                    By continuing, you agree to our{' '}
                                    <a href="#" className="text-green-600 hover:text-green-500 underline">
                                        Terms of Service
                                    </a>{' '}
                                    and{' '}
                                    <a href="#" className="text-green-600 hover:text-green-500 underline">
                                        Privacy Policy
                                    </a>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Preview */}
                    <div className="grid grid-cols-3 gap-4 pt-8">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">1000+</div>
                            <div className="text-xs text-gray-500">Problems</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">500+</div>
                            <div className="text-xs text-gray-500">Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">24/7</div>
                            <div className="text-xs text-gray-500">Tracking</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
