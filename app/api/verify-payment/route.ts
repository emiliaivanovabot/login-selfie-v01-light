// VERIFY PAYMENT STATUS API
// Confirms payment status for user sessions

import { NextRequest, NextResponse } from 'next/server'
import { getPaymentSession } from '@/app/lib/stripe'
import { GDPRSessionManager } from '@/app/lib/database'
import { z } from 'zod'

const verifyPaymentSchema = z.object({
  stripeSessionId: z.string().min(1, 'Stripe session ID is required'),
  appSessionId: z.string().min(1, 'App session ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { stripeSessionId, appSessionId } = verifyPaymentSchema.parse(body)

    // Get our internal session
    const appSession = await GDPRSessionManager.getActiveSession(appSessionId)
    if (!appSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found or expired' },
        { status: 404 }
      )
    }

    // Check if session has the correct Stripe session ID
    if (appSession.stripeSessionId !== stripeSessionId) {
      return NextResponse.json(
        { success: false, error: 'Session mismatch' },
        { status: 400 }
      )
    }

    // If already marked as paid in our database, return success
    if (appSession.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Payment confirmed',
        paymentStatus: 'PAID',
      })
    }

    // Double-check with Stripe to ensure payment was actually completed
    try {
      const stripeSession = await getPaymentSession(stripeSessionId)

      if (stripeSession.payment_status === 'paid') {
        // Update our database if Stripe shows paid but we haven't updated yet
        await GDPRSessionManager.updatePaymentStatus(
          appSessionId,
          stripeSessionId,
          'PAID'
        )

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed',
          paymentStatus: 'PAID',
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Payment not completed',
          paymentStatus: stripeSession.payment_status,
        })
      }
    } catch (stripeError) {
      console.error('Error verifying with Stripe:', stripeError)

      // If Stripe API fails, rely on our database status
      return NextResponse.json({
        success: (appSession.paymentStatus as string) === 'PAID',
        message: (appSession.paymentStatus as string) === 'PAID'
          ? 'Payment confirmed'
          : 'Payment verification pending',
        paymentStatus: appSession.paymentStatus as string,
      })
    }

  } catch (error) {
    console.error('Payment verification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
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