// STRIPE CONNECTION TEST ENDPOINT - EMERGENCY DIAGNOSTIC
// Tests Stripe API connectivity without creating actual payment sessions

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Testing Stripe connection...')

    // Check environment variable
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        status: 'ERROR',
        error: 'STRIPE_SECRET_KEY not found in environment',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }

    console.log('✅ Stripe secret key found')

    // Test Stripe initialization - VERCEL OPTIMIZED CONFIG
    const Stripe = require('stripe')
    const isVercel = !!process.env.VERCEL_URL

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil', // MUST match production!
      typescript: true,
      timeout: isVercel ? 60000 : 30000, // Longer timeout for Vercel
      maxNetworkRetries: 0, // Handle retries manually
      httpAgent: undefined,
      // Vercel-specific optimizations
      host: 'api.stripe.com',
      port: 443,
      protocol: 'https',
      telemetry: false,
    })

    console.log('✅ Stripe client initialized')

    // Test API connection with simple request
    const account = await stripe.accounts.retrieve()
    console.log('✅ Stripe API connection successful')

    return NextResponse.json({
      status: 'SUCCESS',
      stripe: {
        connected: true,
        accountId: account.id,
        country: account.country,
        capabilities: Object.keys(account.capabilities || {}),
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('💥 Stripe connection test failed:', error)

    const errorInfo = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown',
      errorCode: (error as any)?.code || 'NO_CODE',
      errorParam: (error as any)?.param || 'NO_PARAM',
      statusCode: (error as any)?.statusCode || 'NO_STATUS',
      timestamp: new Date().toISOString(),
    }

    if (error instanceof Error && error.message.includes('Invalid API Key')) {
      errorInfo.error = 'Invalid Stripe API Key - check production environment variables'
    }

    return NextResponse.json(errorInfo, { status: 500 })
  }
}

// Test payment session creation without redirect
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Testing payment session creation...')

    const body = await request.json()
    const sessionId = body.sessionId || `test-${Date.now()}`

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        status: 'ERROR',
        error: 'STRIPE_SECRET_KEY not found',
      }, { status: 500 })
    }

    const Stripe = require('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil', // Match production
      timeout: 30000, // Longer timeout for Vercel
      maxNetworkRetries: 3,
      httpAgent: undefined,
    })

    // Test minimal payment session creation
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Test Payment Session',
          },
          unit_amount: 500, // €5.00
        },
        quantity: 1,
      }],
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      metadata: {
        sessionId,
        test: 'true',
      },
    })

    return NextResponse.json({
      status: 'SUCCESS',
      sessionCreated: true,
      sessionId: session.id,
      sessionUrl: session.url,
      metadata: session.metadata,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('💥 Payment session test failed:', error)

    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}