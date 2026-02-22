'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ReactNode, createContext, useContext, useEffect } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const GoogleAuthAvailableContext = createContext<boolean>(false);

export function useGoogleAuthAvailable() {
    return useContext(GoogleAuthAvailableContext);
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn('⚠️ NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google login will be disabled.');
            console.info('ℹ️ See GOOGLE_OAUTH_SETUP.md for setup instructions.');
        } else {
            console.log('✅ Google OAuth is configured');
        }
    }, []);

    if (!GOOGLE_CLIENT_ID) {
        return (
            <GoogleAuthAvailableContext.Provider value={false}>
                {children}
            </GoogleAuthAvailableContext.Provider>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleAuthAvailableContext.Provider value={true}>
                {children}
            </GoogleAuthAvailableContext.Provider>
        </GoogleOAuthProvider>
    );
}
