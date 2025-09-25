// STRIPE WEBHOOK HANDLER
// Processes payment confirmations and updates session status

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, PaymentSessionMetadata } from '@/app/lib/stripe'
import { GDPRSessionManager } from '@/app/lib/database'
import { headers } from 'next/headers'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Get request body and signature
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature, webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handlePaymentSuccess(session)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handlePaymentExpired(session)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata as unknown as PaymentSessionMetadata
    const { sessionId } = metadata

    if (!sessionId) {
      console.error('Missing sessionId in payment metadata')
      return
    }

    console.log(`Payment successful for session: ${sessionId}`)

    // Update session status to PAID
    await GDPRSessionManager.updatePaymentStatus(
      sessionId,
      session.id,
      'PAID'
    )

    console.log(`Session ${sessionId} marked as PAID`)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentExpired(session: Stripe.Checkout.Session) {
  try {
    const metadata = session.metadata as unknown as PaymentSessionMetadata
    const { sessionId } = metadata

    if (!sessionId) {
      console.error('Missing sessionId in expired payment metadata')
      return
    }

    console.log(`Payment expired for session: ${sessionId}`)

    // Update session status to FAILED
    await GDPRSessionManager.updatePaymentStatus(
      sessionId,
      session.id,
      'FAILED'
    )

    console.log(`Session ${sessionId} marked as FAILED due to expiration`)

  } catch (error) {
    console.error('Error handling payment expiration:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Get the session from the payment intent
    if (!paymentIntent.metadata?.sessionId) {
      console.error('Missing sessionId in payment intent metadata')
      return
    }

    const sessionId = paymentIntent.metadata.sessionId
    console.log(`Payment failed for session: ${sessionId}`)

    // Update session status to FAILED
    await GDPRSessionManager.updatePaymentStatus(
      sessionId,
      paymentIntent.id,
      'FAILED'
    )

    console.log(`Session ${sessionId} marked as FAILED due to payment failure`)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs'