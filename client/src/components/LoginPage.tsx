import React from 'react'
import { config } from '../config/api'
import { Button } from './ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx'

const LoginPage: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.GOOGLE}`
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4">
            <div className="absolute inset-0 bg-gray-50/20"></div>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome to <span className="text-green-600">TrackMe</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Your DSA journey starts here
                    </p>
                </div>

                {/* Login Card */}
                <Card className="bg-white border-gray-200 shadow-2xl">
                    <CardHeader className="text-center space-y-2 pb-8">
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            Get Started
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Sign in with your Google account to continue
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-0">
                        <Button
                            onClick={handleGoogleLogin}
                            className="w-full bg-white hover:bg-gray-50 text-gray-900 border-0 py-4 text-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                            size="lg"
                        >
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
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

                        <div className="text-center">
                            <p className="text-xs text-slate-400">
                                By continuing, you agree to our{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                                    Privacy Policy
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-slate-400 text-sm">
                        Secure authentication powered by Google
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
