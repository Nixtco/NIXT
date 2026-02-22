'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGlobalAuth } from '@/lib/auth-context';
import { GoogleLoginButton } from '@/components/GoogleLoginButton';
import RoleSelectionModal from '@/components/UI/RoleSelectionModal';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, isLoading: authLoading, user, isAdmin } = useGlobalAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [hasRedirected, setHasRedirected] = useState(false);

    // Function to handle user redirection based on role
    const handleUserRedirect = useCallback(() => {
        if (!user || hasRedirected) return;

        setHasRedirected(true);

        // If admin/owner - they have access to both controllers and dashboard
        // Show modal to let them choose
        if (isAdmin) {
            setShowRoleModal(true);
        } 
        // If regular user - redirect to dashboard
        else if (user.role === 'user') {
            router.push('/dashboard');
        }
        // Default fallback to account page
        else {
            router.push('/account');
        }
    }, [user, hasRedirected, isAdmin, router]);

    // Redirect if user is logged in
    useEffect(() => {
        if (!authLoading && isAuthenticated && user && !hasRedirected) {
            handleUserRedirect();
        }
    }, [authLoading, isAuthenticated, user, hasRedirected, handleUserRedirect]);

    // Show loading only while checking initial authentication state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);
        
        if (result.success) {
            // The useEffect will handle the redirect
            // based on the user's role
        } else {
            setError(result.error || 'Login failed');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{
            background: '#000',
            backgroundImage: 'radial-gradient(circle at bottom center, #001a4d 0%, transparent 85%)'
        }}>
            <div className="max-w-md w-full">
                {/* Logo/Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold mb-3" style={{
                        fontFamily: 'Poppins, sans-serif',
                        letterSpacing: '-2px',
                        background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))'
                    }} dir="ltr">nixt</h1>
                    <p className="text-sm uppercase tracking-widest" style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        letterSpacing: '8px'
                    }}>welcome back</p>
                </div>

                {/* Login Form */}
                <div className="backdrop-blur-lg rounded-2xl shadow-xl p-8" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {error && (
                        <div className="mb-6 p-4 rounded-lg text-red-400 text-sm text-center" style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg text-white transition-all"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg text-white transition-all"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                placeholder="••••••••"
                                dir="ltr"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                padding: '0 24px',
                                height: '48px',
                                borderRadius: '99px',
                                background: 'white',
                                color: 'black',
                                border: '1px solid white'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'white'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.background = 'white'
                                    e.currentTarget.style.color = 'black'
                                }
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    Loading...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
                        <span className="px-4 text-xs uppercase tracking-widest" style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            letterSpacing: '3px'
                        }}>or</span>
                        <div className="flex-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}></div>
                    </div>

                    {/* Google Login Button */}
                    <GoogleLoginButton
                        onSuccess={() => {
                            // The useEffect will handle the redirect
                            // based on the user's role
                        }}
                        onError={(errorMsg) => setError(errorMsg)}
                    />

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="font-medium transition-opacity hover:opacity-60" style={{ color: 'white' }}>
                            Sign up now
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link href="/" className="text-xs uppercase tracking-widest transition-opacity hover:opacity-60" style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        letterSpacing: '2px'
                    }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Role Selection Modal */}
            <RoleSelectionModal 
                isOpen={showRoleModal} 
                onClose={() => setShowRoleModal(false)} 
            />
        </div>
    );
}
