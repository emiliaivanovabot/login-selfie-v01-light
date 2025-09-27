// GDPR CONSENT MANAGEMENT API
// Handles cookie consent, data processing consent, and privacy preferences

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GDPRSessionManager } from '@/app/lib/database'

const ConsentSchema = z.object({
  dataConsent: z.boolean(),
  cookieConsent: z.boolean(),
  marketingConsent: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const consent = ConsentSchema.parse(body)

    // Generate a temporary session ID for fallback mode
    const { v4: uuidv4 } = await import('uuid')
    const sessionId = uuidv4()

    // FALLBACK MODE: Use cookie-based session when database is unavailable
    try {
      // Get client info for security (not tracking)
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      const userAgent = request.headers.get('user-agent')

      // Try database operation first
      const session = await GDPRSessionManager.createSession({
        dataConsent: consent.dataConsent,
        cookieConsent: consent.cookieConsent,
        ipAddress: ipAddress?.split(',')[0], // First IP in case of proxy chain
        userAgent: userAgent || undefined,
      })

      // Set secure, httpOnly cookie for session tracking
      const response = NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        message: 'Consent preferences saved',
        dataRetention: '24 hours',
        rights: [
          'Right to access your data',
          'Right to rectification',
          'Right to erasure (deletion)',
          'Right to data portability',
          'Right to object to processing'
        ]
      })

      // Set secure session cookie
      response.cookies.set('gdpr-session', session.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })

      return response

    } catch (dbError) {
      console.warn('Database unavailable, using fallback consent mechanism:', dbError)

      // FALLBACK: Create cookie-only session for immediate functionality
      const response = NextResponse.json({
        success: true,
        sessionId: sessionId,
        message: 'Consent preferences saved (fallback mode)',
        dataRetention: '24 hours',
        fallbackMode: true,
        rights: [
          'Right to access your data',
          'Right to rectification',
          'Right to erasure (deletion)',
          'Right to data portability',
          'Right to object to processing'
        ]
      })

      // Store consent in secure cookie for fallback
      const consentData = JSON.stringify({
        sessionId,
        dataConsent: consent.dataConsent,
        cookieConsent: consent.cookieConsent,
        marketingConsent: consent.marketingConsent,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })

      response.cookies.set('gdpr-session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })

      response.cookies.set('gdpr-consent', consentData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
      })

      return response
    }

  } catch (error) {
    console.error('GDPR consent error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process consent',
        code: 'CONSENT_PROCESSING_FAILED'
      },
      { status: 400 }
    )
  }
}

// Get current consent status
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('gdpr-session')?.value
    const consentCookie = request.cookies.get('gdpr-consent')?.value

    if (!sessionId) {
      return NextResponse.json({
        hasConsent: false,
        message: 'No consent session found'
      })
    }

    // Try database first, then fallback to cookie
    try {
      const session = await GDPRSessionManager.getActiveSession(sessionId)

      if (!session) {
        // Check fallback cookie if database session doesn't exist
        if (consentCookie) {
          try {
            const consentData = JSON.parse(consentCookie)
            const expiresAt = new Date(consentData.expiresAt)

            if (expiresAt > new Date()) {
              return NextResponse.json({
                hasConsent: true,
                sessionId: consentData.sessionId,
                consent: {
                  data: consentData.dataConsent,
                  cookies: consentData.cookieConsent,
                },
                expiresAt: consentData.expiresAt,
                fallbackMode: true,
                message: 'Using fallback consent mechanism'
              })
            }
          } catch (parseError) {
            console.warn('Failed to parse consent cookie:', parseError)
          }
        }

        return NextResponse.json({
          hasConsent: false,
          message: 'Session expired or invalid'
        })
      }

      return NextResponse.json({
        hasConsent: true,
        sessionId: session.sessionId,
        consent: {
          data: session.dataConsent,
          cookies: session.cookieConsent,
        },
        expiresAt: session.expiresAt,
        dataProcessingActivities: session.dataProcessingLogs?.map((log: any) => ({
          action: log.action,
          purpose: log.purpose,
          legalBasis: log.legalBasis,
          timestamp: log.timestamp,
        })),
      })

    } catch (dbError) {
      console.warn('Database unavailable, checking fallback consent:', dbError)

      // FALLBACK: Check consent cookie when database is unavailable
      if (consentCookie) {
        try {
          const consentData = JSON.parse(consentCookie)
          const expiresAt = new Date(consentData.expiresAt)

          if (expiresAt > new Date()) {
            return NextResponse.json({
              hasConsent: true,
              sessionId: consentData.sessionId,
              consent: {
                data: consentData.dataConsent,
                cookies: consentData.cookieConsent,
              },
              expiresAt: consentData.expiresAt,
              fallbackMode: true,
              message: 'Using fallback consent mechanism'
            })
          }
        } catch (parseError) {
          console.warn('Failed to parse consent cookie:', parseError)
        }
      }

      return NextResponse.json({
        hasConsent: false,
        message: 'No valid consent found (database unavailable)'
      })
    }

  } catch (error) {
    console.error('GDPR consent status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve consent status' },
      { status: 500 }
    )
  }
}