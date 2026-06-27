'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGlobalAuth } from '@/lib/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

export default function AccountPage() {
    const router = useRouter();
    const { user, token, isAuthenticated, isLoading, isOwner, isAdmin, hasPermission, hasActiveSubscription, subscriptions, logout, refreshUser } = useGlobalAuth();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Cancel subscription
    const handleCancelSubscription = async (subscriptionId: string) => {
        if (!token || !confirm('Are you sure you want to cancel the subscription?')) return;
        
        setActionLoading(subscriptionId);
        try {
            const response = await fetch(`${API_BASE_URL}/subscriptions/me/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                alert('Subscription cancelled successfully');
                await refreshUser();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to cancel subscription');
            }
        } catch {
            alert('Error connecting to server');
        } finally {
            setActionLoading(null);
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                        Logout
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-700">
                    {/* Avatar && Name */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-700">
                        <div className="relative">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.display_name || user.email}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-500">
                                    {user.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                </div>
                            )}
                            {user.auth_provider === 'google' && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'}
                            </h1>
                            <p className="text-gray-400">{user.email}</p>
                            <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                                user.auth_provider === 'google' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-green-500/20 text-green-400'
                            }`}>
                                {user.auth_provider === 'google' ? 'Google Account' : 'Local Account'}
                            </span>
                            {/* Role Badge */}
                            {user.role && (
                                <span className={`inline-block mt-2 ml-2 px-3 py-1 text-xs font-medium rounded-full ${
                                    user.role === 'owner' 
                                        ? 'bg-purple-500/20 text-purple-400' 
                                        : user.role === 'admin'
                                        ? 'bg-orange-500/20 text-orange-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {user.role === 'owner' ? 'Owner' : user.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Admin Navigation - Only for owners and admins */}
                    {(isOwner || isAdmin) && (
                        <div className="mb-8 pb-8 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white mb-4">Control Panel</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Users Link - for owners and admins with view_users permission */}
                                {(isOwner || hasPermission('view_users')) && (
                                    <Link
                                        href="/users"
                                        className="flex items-center gap-4 p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors group"
                                    >
                                        <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">User Management</h3>
                                            <p className="text-gray-400 text-sm">View and manage all users</p>
                                        </div>
                                    </Link>
                                )}

                                {/* Admins Link - for owners only */}
                                {isOwner && (
                                    <Link
                                        href="/admins"
                                        className="flex items-center gap-4 p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors group"
                                    >
                                        <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">Admin Management</h3>
                                            <p className="text-gray-400 text-sm">Add and manage admin permissions</p>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Account Details</h2>
                        
                        <div className="grid gap-4">
                            <div className="bg-gray-700/30 rounded-lg p-4">
                                <label className="text-sm text-gray-400">User ID</label>
                                <p className="text-white font-mono text-sm mt-1" dir="ltr">{user.id}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <label className="text-sm text-gray-400">First Name</label>
                                    <p className="text-white mt-1">{user.first_name || 'Not specified'}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <label className="text-sm text-gray-400">Last Name</label>
                                    <p className="text-white mt-1">{user.last_name || 'Not specified'}</p>
                                </div>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg p-4">
                                <label className="text-sm text-gray-400">Email</label>
                                <p className="text-white mt-1" dir="ltr">{user.email}</p>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg p-4">
                                <label className="text-sm text-gray-400">Display Name</label>
                                <p className="text-white mt-1">{user.display_name || 'Not specified'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <label className="text-sm text-gray-400">Created At</label>
                                    <p className="text-white mt-1 text-sm">{formatDate(user.created_at)}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded-lg p-4">
                                    <label className="text-sm text-gray-400">Last Updated</label>
                                    <p className="text-white mt-1 text-sm">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Section */}
                    <div className="mt-8 pt-8 border-t border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-4">Subscriptions</h2>
                        
                        {hasActiveSubscription && subscriptions.length > 0 ? (
                            <div className="space-y-4">
                                {subscriptions.filter(sub => sub.hasActiveSubscription).map((subscription, index) => (
                                    <div key={subscription.stripeSubscriptionId || index} className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold text-lg">{subscription.planName}</h3>
                                                    <span className={`text-sm ${
                                                        subscription.status === 'active' ? 'text-green-400' : 
                                                        subscription.status === 'trialing' ? 'text-blue-400' : 
                                                        'text-yellow-400'
                                                    }`}>
                                                        {subscription.status === 'active' ? 'Active' : 
                                                         subscription.status === 'trialing' ? 'Trial Period' : 
                                                         subscription.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-bold text-xl">
                                                    {subscription.amount ? `$${(subscription.amount / 100).toFixed(2)}` : 'Free'}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    /{subscription.billingInterval === 'month' ? 'monthly' : 
                                                      subscription.billingInterval === 'year' ? 'yearly' : 
                                                      subscription.billingInterval}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <label className="text-xs text-gray-400">Period End Date</label>
                                                <p className="text-white mt-1 text-sm">{formatDate(subscription.currentPeriodEnd || undefined)}</p>
                                            </div>
                                            <div className="bg-gray-800/50 rounded-lg p-3">
                                                <label className="text-xs text-gray-400">Auto Renewal</label>
                                                <p className={`mt-1 text-sm ${subscription.cancelAtPeriodEnd ? 'text-red-400' : 'text-green-400'}`}>
                                                    {subscription.cancelAtPeriodEnd ? 'Will Cancel' : 'Enabled'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4">
                                            {(subscription.status === 'active' || subscription.status === 'trialing') && subscription.stripeSubscriptionId && (
                                                <button 
                                                    onClick={() => handleCancelSubscription(subscription.stripeSubscriptionId!)}
                                                    disabled={actionLoading === subscription.stripeSubscriptionId}
                                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    {actionLoading === subscription.stripeSubscriptionId ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    )}
                                                    Cancel Subscription
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-700/30 border border-gray-600 rounded-xl p-6 text-center">
                                <div className="p-3 bg-gray-600/30 rounded-full w-fit mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-white font-medium mb-2">No Active Subscription</h3>
                                <p className="text-gray-400 text-sm mb-4">Subscribe now to get additional features</p>
                                <Link
                                    href="/pricing"
                                    className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all"
                                >
                                    View Plans
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
