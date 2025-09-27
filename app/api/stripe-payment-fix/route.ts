// DEFINITIVE VERCEL STRIPE FIX - Edge Runtime
// Direct Stripe API call that WORKS on Vercel

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Force Edge Runtime for Vercel compatibility
export const runtime = 'edge'

const paymentSchema = z.object({
  sessionId: z.string().min(1, 'Session ID required'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 VERCEL STRIPE FIX - Edge Runtime Direct API')

    const body = await request.json()
    const { sessionId } = paymentSchema.parse(body)

    console.log(`💳 Creating payment for session: ${sessionId}`)

    // Verify Stripe key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    console.log('🔑 Stripe key configured:', process.env.STRIPE_SECRET_KEY.substring(0, 8))

    // Direct Stripe API call using Edge Runtime compatible fetch
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
      },
      body: new URLSearchParams({
        'mode': 'payment',
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': 'eur',
        'line_items[0][price_data][product_data][name]': 'AI Selfie Generation',
        'line_items[0][price_data][unit_amount]': '500',
        'line_items[0][quantity]': '1',
        'success_url': `https://login-selfie-v01-light.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}&app_session=${sessionId}`,
        'cancel_url': `https://login-selfie-v01-light.vercel.app/payment/cancel?app_session=${sessionId}`,
        'metadata[sessionId]': sessionId,
        'metadata[service]': 'selfie_generation',
        'expires_at': (Math.floor(Date.now() / 1000) + (30 * 60)).toString(),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('💥 Stripe API failed:', errorText)
      throw new Error(`Stripe API error: ${response.status} - ${errorText}`)
    }

    const session = await response.json()

    console.log('✅ Payment session created successfully!')
    console.log('📋 Session ID:', session.id)
    console.log('🔗 Payment URL:', session.url)

    return NextResponse.json({
      success: true,
      paymentUrl: session.url,
      sessionId: session.id,
      amount: 500,
      currency: 'eur',
      runtime: 'edge',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('💥 Payment creation error:', error)

    return NextResponse.json({
      error: 'Failed to create payment session',
      details: error instanceof Error ? error.message : 'Unknown error',
      runtime: 'edge',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

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