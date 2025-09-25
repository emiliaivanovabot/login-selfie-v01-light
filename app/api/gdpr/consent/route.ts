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

    // Get client info for security (not tracking)
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    const userAgent = request.headers.get('user-agent')

    // Create GDPR-compliant session
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

    if (!sessionId) {
      return NextResponse.json({
        hasConsent: false,
        message: 'No consent session found'
      })
    }

    const session = await GDPRSessionManager.getActiveSession(sessionId)

    if (!session) {
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

  } catch (error) {
    console.error('GDPR consent status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve consent status' },
      { status: 500 }
    )
  }
}