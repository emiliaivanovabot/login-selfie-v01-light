// GDPR-COMPLIANT ROOT LAYOUT
// Sets up the application with privacy-first design

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Selfie Generator - GDPR Compliant',
  description: 'Create professional AI selfies with complete privacy protection. GDPR compliant with automatic 24h data deletion.',
  keywords: ['AI selfie', 'GDPR compliant', 'privacy protection', 'data deletion', 'EU servers'],
  authors: [{ name: 'AI Selfie Generator' }],
  creator: 'AI Selfie Generator',
  publisher: 'AI Selfie Generator',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add search console verification when available
  },
  alternates: {
    canonical: process.env.NEXTAUTH_URL || 'https://aiselfiegenerator.com',
  },
  openGraph: {
    type: 'website',
    locale: 'en_EU',
    url: process.env.NEXTAUTH_URL || 'https://aiselfiegenerator.com',
    siteName: 'AI Selfie Generator',
    title: 'AI Selfie Generator - GDPR Compliant',
    description: 'Create professional AI selfies with complete privacy protection. GDPR compliant with automatic 24h data deletion.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Selfie Generator - Privacy First',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Selfie Generator - GDPR Compliant',
    description: 'Create professional AI selfies with complete privacy protection. GDPR compliant with automatic 24h data deletion.',
    images: ['/twitter-image.jpg'],
    creator: '@aiselfiegenerator',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Privacy-focused meta tags */}
        <meta name="privacy-policy" content="/privacy-policy" />
        <meta name="data-retention" content="24 hours" />
        <meta name="gdpr-compliant" content="true" />
        <meta name="eu-data-residency" content="true" />

        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for external services */}
        <link rel="dns-prefetch" href="https://fal.ai" />
        <link rel="dns-prefetch" href="https://api.stripe.com" />
      </head>

      <body className={`${inter.className} h-full antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
        >
          Skip to main content
        </a>

        {/* Main application content */}
        <div id="main-content" className="min-h-full">
          {children}
        </div>

        {/* GDPR compliance script (if needed for analytics) */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Privacy-first analytics setup
                window.gdprConsent = false;

                // Check for consent cookie
                const consentCookie = document.cookie
                  .split('; ')
                  .find(row => row.startsWith('gdpr-session='));

                if (consentCookie) {
                  window.gdprConsent = true;
                  // Initialize analytics only with consent
                  console.log('GDPR consent found, analytics enabled');
                } else {
                  console.log('No GDPR consent, analytics disabled');
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}