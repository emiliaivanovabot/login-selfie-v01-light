// EMERGENCY STRIPE PROXY - VERCEL BYPASS SOLUTION
// Routes Stripe API calls through fetch() instead of Stripe SDK

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY STRIPE PROXY - Using fetch() bypass')

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        error: 'Stripe configuration missing'
      }, { status: 500 })
    }

    const body = await request.json()
    const { sessionId } = body

    // Create payment session using direct HTTP requests instead of Stripe SDK
    const stripePayload = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'AI Selfie Generation',
            description: 'Professional AI selfie with GDPR compliance',
          },
          unit_amount: 500, // €5.00
        },
        quantity: 1,
      }],
      success_url: `https://login-selfie-v01-light.vercel.app/payment/success?session_id={CHECKOUT_SESSION_ID}&app_session=${sessionId}`,
      cancel_url: `https://login-selfie-v01-light.vercel.app/payment/cancel?app_session=${sessionId}`,
      metadata: {
        sessionId,
        service: 'selfie_generation',
        gdprConsent: 'true',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    }

    console.log('🔧 Making direct HTTP call to Stripe API...')

    // Direct HTTP call to Stripe API - bypass SDK networking issues
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-08-27.basil',
      },
      body: new URLSearchParams({
        'mode': stripePayload.mode,
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': stripePayload.line_items[0].price_data.currency,
        'line_items[0][price_data][product_data][name]': stripePayload.line_items[0].price_data.product_data.name,
        'line_items[0][price_data][product_data][description]': stripePayload.line_items[0].price_data.product_data.description,
        'line_items[0][price_data][unit_amount]': stripePayload.line_items[0].price_data.unit_amount.toString(),
        'line_items[0][quantity]': '1',
        'success_url': stripePayload.success_url,
        'cancel_url': stripePayload.cancel_url,
        'metadata[sessionId]': sessionId,
        'metadata[service]': 'selfie_generation',
        'metadata[gdprConsent]': 'true',
        'expires_at': stripePayload.expires_at.toString(),
      }).toString(),
    })

    console.log('📡 Stripe HTTP response status:', stripeResponse.status)

    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      console.error('💥 Stripe HTTP error:', errorText)
      throw new Error(`Stripe API HTTP error: ${stripeResponse.status} ${errorText}`)
    }

    const session = await stripeResponse.json()
    console.log('✅ Direct HTTP Stripe call succeeded:', {
      id: session.id,
      url: session.url ? 'CREATED' : 'NO_URL'
    })

    return NextResponse.json({
      success: true,
      paymentUrl: session.url,
      sessionId: session.id,
      debug: {
        method: 'direct_http',
        bypass: 'vercel_sdk_limitation',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('💥 Stripe proxy error:', error)

    return NextResponse.json({
      error: 'Failed to create payment session via proxy',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'direct_http_proxy',
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}