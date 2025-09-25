// CREATE STRIPE PAYMENT SESSION API
// Generates secure payment session for selfie generation

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentSession } from '@/app/lib/stripe'
import { GDPRSessionManager } from '@/app/lib/database'
import { z } from 'zod'

const createPaymentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { sessionId } = createPaymentSchema.parse(body)

    // Verify session exists and is active
    const appSession = await GDPRSessionManager.getActiveSession(sessionId)
    if (!appSession) {
      return NextResponse.json(
        { error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    // Check if user has given consent
    if (!appSession.dataConsent) {
      return NextResponse.json(
        { error: 'Data consent required for payment processing' },
        { status: 400 }
      )
    }

    // Check if payment already exists and is successful
    if (appSession.paymentStatus === 'PAID') {
      return NextResponse.json(
        { error: 'Session already paid' },
        { status: 400 }
      )
    }

    // Create Stripe payment session
    const paymentSession = await createPaymentSession(sessionId)

    // Update our session with payment info
    await GDPRSessionManager.updatePaymentStatus(
      sessionId,
      paymentSession.id,
      'PENDING'
    )

    // Return payment session URL
    return NextResponse.json({
      success: true,
      paymentUrl: paymentSession.url,
      sessionId: paymentSession.id,
    })

  } catch (error) {
    console.error('Payment session creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}