// VERCEL SERVERLESS STRIPE FIX - Direct API approach
// Bypasses Stripe SDK networking issues on Vercel

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Force Edge Runtime for better Vercel networking
export const runtime = 'edge'

const createPaymentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY PAYMENT API - Bypassing database for revenue recovery')

    // Parse and validate request
    const body = await request.json()
    const { sessionId } = createPaymentSchema.parse(body)

    console.log(`💳 Creating payment session for: ${sessionId}`)

    // EDGE RUNTIME: No file system access, allow all payment requests
    console.log('🚀 Edge Runtime - allowing payment for session:', sessionId)

    // VERCEL FIX: Direct Stripe API call (no SDK)
    // This bypasses the networking issues with Stripe SDK on Vercel
    console.log('💳 Creating Stripe session via direct API call...')

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
        'User-Agent': 'Vercel-Edge-Runtime',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'AI Selfie Generation',
        'line_items[0][price_data][product_data][description]': 'Professional AI selfie with GDPR compliance',
        'line_items[0][price_data][unit_amount]': '500',
        'line_items[0][quantity]': '1',
        'success_url': `https://login-selfie-v01-light.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}&app_session=${sessionId}`,
        'cancel_url': `https://login-selfie-v01-light.vercel.app/payment/cancel?app_session=${sessionId}`,
        'metadata[sessionId]': sessionId,
        'metadata[service]': 'selfie_generation',
        'metadata[gdprConsent]': 'true',
        'expires_at': (Math.floor(Date.now() / 1000) + (30 * 60)).toString(),
      }).toString(),
    })

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      console.error('💥 Stripe API error:', {
        status: stripeResponse.status,
        statusText: stripeResponse.statusText,
        error: errorText
      })
      throw new Error(`Stripe API error: ${stripeResponse.status} - ${errorText}`)
    }

    const session = await stripeResponse.json()
    const paymentSession = {
      id: session.id,
      url: session.url
    }

    console.log(`✅ Stripe payment session created: ${paymentSession.id}`)
    console.log(`💰 Payment URL: ${paymentSession.url}`)

    // Return payment session URL - CRITICAL FOR REVENUE
    return NextResponse.json({
      success: true,
      paymentUrl: paymentSession.url,
      sessionId: paymentSession.id,
      amount: 500,
      currency: 'eur',
      debug: {
        runtime: 'edge',
        timestamp: new Date().toISOString(),
        stripeApiVersion: '2025-08-27.basil'
      }
    })

  } catch (error) {
    console.error('💥 Payment session creation error:', error)
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      constructor: error?.constructor?.name
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create payment session',
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType: error?.constructor?.name || 'Unknown',
          timestamp: new Date().toISOString(),
          runtime: 'edge'
        }
      },
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