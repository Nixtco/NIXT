'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGlobalAuth } from '@/lib/auth-context';
import RoleSelectionModal from '@/components/UI/RoleSelectionModal';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading: authLoading, user, isAdmin } = useGlobalAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        display_name: ''
    });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Check password length
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        const result = await register({
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name || undefined,
            last_name: formData.last_name || undefined,
            display_name: formData.display_name || undefined
        });
        
        if (result.success) {
            // The useEffect will handle the redirect
            // based on the user's role
        } else {
            setError(result.error || 'Registration failed');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{
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
                    }}>join us today</p>
                </div>

                {/* Register Form */}
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-xs uppercase tracking-wider mb-2" style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    letterSpacing: '2px'
                                }}>
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-white transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-xs uppercase tracking-wider mb-2" style={{
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    letterSpacing: '2px'
                                }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-white transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label htmlFor="display_name" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Display Name
                            </label>
                            <input
                                type="text"
                                id="display_name"
                                name="display_name"
                                value={formData.display_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-white transition-all"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                placeholder="Your public display name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Email <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
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
                            <p className="mt-1 text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>At least 6 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-xs uppercase tracking-wider mb-2" style={{
                                color: 'rgba(255, 255, 255, 0.6)',
                                letterSpacing: '2px'
                            }}>
                                Confirm Password <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                            className="w-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
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
                                    Registering...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium transition-opacity hover:opacity-60" style={{ color: 'white' }}>
                            Login
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
