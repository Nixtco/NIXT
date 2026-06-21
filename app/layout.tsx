import type { Metadata, Viewport } from "next";
import { Poppins, Cairo } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider as DashboardAuthProvider } from "@/hooks/useAuth";
import { AuthProvider } from "@/lib/auth-context";
import { GoogleAuthProvider } from "@/lib/google-auth-provider";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Nixt Group | Digital Future",
  description: "Digital Innovation & Tech Group - Building the future with integrated software solutions & smart systems development",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/sahm_logo.png" as="image" />
        <link rel="preload" href="/LogoWithName.png" as="image" />
        <link rel="preload" href="/Asset 11.png" as="image" />
        <link rel="preload" href="/logo.webp" as="image" />
        <link rel="preload" href="/October.webp" as="image" />
        <link rel="preload" href="/IMS.png" as="image" />
      </head>
      <body className={`${poppins.variable} ${cairo.variable}`}>
        <GoogleAuthProvider>
          <AuthProvider>
            <LanguageProvider>
              <DashboardAuthProvider>
                {children}
              </DashboardAuthProvider>
            </LanguageProvider>
          </AuthProvider>
        </GoogleAuthProvider>
      </body>
    </html>
  );
}
