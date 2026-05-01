'use client';

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useGlobalAuth } from '@/lib/auth-context';
import { useGoogleAuthAvailable } from '@/lib/google-auth-provider';
import { useState } from 'react';

interface GoogleLoginButtonProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
    const { loginWithGoogle } = useGlobalAuth();
    const googleAuthAvailable = useGoogleAuthAvailable();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            onError?.('No data received from Google');
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await loginWithGoogle(credentialResponse.credential);
            
            if (result.success) {
                await new Promise(resolve => setTimeout(resolve, 100));
                onSuccess?.();
            } else {
                onError?.(result.error || 'Google login failed');
            }
        } catch (error) {
            console.error('Google login error:', error);
            onError?.('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    if (!googleAuthAvailable) {
        return null;
    }

    return (
        <div className="w-full flex justify-center">
            {isLoading ? (
                <button
                    type="button"
                    disabled
                    className="w-full font-medium flex items-center justify-center gap-3 opacity-70 cursor-not-allowed"
                    style={{
                        height: '48px',
                        borderRadius: '99px',
                        background: 'white',
                        color: '#111827',
                        border: '1px solid rgba(255, 255, 255, 0.8)'
                    }}
                >
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-800"></div>
                    Loading...
                </button>
            ) : (
                <div
                    className="w-full"
                    style={{
                        // Make Google button feel like the site's pill buttons
                        height: '48px',
                        borderRadius: '99px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: 'rgba(255, 255, 255, 0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => onError?.('Google login failed')}
                        useOneTap={false}
                        theme="outline"
                        shape="pill"
                        size="large"
                        width="380"
                        text="continue_with"
                    />
                </div>
            )}
        </div>
    );
}
