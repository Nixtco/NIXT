'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface RoleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RoleSelectionModal({ isOpen, onClose }: RoleSelectionModalProps) {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    if (!isOpen) return null;

    const handleNavigation = (path: string) => {
        setIsNavigating(true);
        router.push(path);
    };

    // Prevent closing if already navigating
    const handleClose = () => {
        if (!isNavigating) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(10px)'
            }}
            onClick={handleClose}
        >
            <div 
                className="w-full max-w-lg backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-8 text-center" style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <h2 className="text-3xl font-bold mb-3" style={{
                        fontFamily: 'Poppins, sans-serif',
                        letterSpacing: '-1px',
                        background: 'linear-gradient(180deg, #fff 0%, #aaa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        اختر وجهتك
                    </h2>
                    <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        لديك صلاحيات متعددة، اختر المكان الذي تريد الذهاب إليه
                    </p>
                </div>

                {/* Options */}
                <div className="p-8 space-y-4">
                    {/* Controllers Option */}
                    <button
                        onClick={() => handleNavigation('/controllers')}
                        disabled={isNavigating}
                        className="w-full p-6 rounded-xl transition-all duration-300 text-right disabled:opacity-50"
                        style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{
                                background: 'rgba(59, 130, 246, 0.2)'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'white' }}>
                                    لوحة التحكم - Controllers
                                </h3>
                                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    إدارة كاملة للنظام مع صلاحيات المدير للمشاريع والعملاء والإحصائيات
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Dashboard Option */}
                    <button
                        onClick={() => handleNavigation('/dashboard')}
                        disabled={isNavigating}
                        className="w-full p-6 rounded-xl transition-all duration-300 text-right disabled:opacity-50"
                        style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{
                                background: 'rgba(16, 185, 129, 0.2)'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold mb-2" style={{ color: 'white' }}>
                                    لوحة العميل - Dashboard
                                </h3>
                                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                    متابعة مشاريعك الخاصة وإدارة حسابك كعميل
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 text-center" style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <button
                        onClick={handleClose}
                        disabled={isNavigating}
                        className="text-sm uppercase tracking-widest transition-opacity hover:opacity-60 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            letterSpacing: '2px'
                        }}
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
}
