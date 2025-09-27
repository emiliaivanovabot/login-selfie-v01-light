// EMERGENCY HTTP TEST - Direct Stripe API call without SDK
// Tests if fetch() can reach Stripe when SDK cannot

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing direct HTTP connection to Stripe API...')

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        status: 'ERROR',
        error: 'STRIPE_SECRET_KEY not found'
      }, { status: 500 })
    }

    console.log('✅ Stripe secret key found')

    // Test direct HTTP call to Stripe API
    console.log('📡 Making direct HTTP request to api.stripe.com...')

    const response = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Stripe-Version': '2025-08-27.basil',
      },
    })

    console.log('📡 HTTP response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('💥 HTTP request failed:', errorText)
      return NextResponse.json({
        status: 'ERROR',
        error: `HTTP ${response.status}: ${errorText}`,
        method: 'direct_http'
      }, { status: 500 })
    }

    const account = await response.json()
    console.log('✅ Direct HTTP call succeeded')

    return NextResponse.json({
      status: 'SUCCESS',
      method: 'direct_http',
      stripe: {
        connected: true,
        accountId: account.id,
        country: account.country,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelUrl: process.env.VERCEL_URL,
        vercelRegion: process.env.VERCEL_REGION,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('💥 Direct HTTP test failed:', error)

    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      method: 'direct_http',
      errorType: error?.constructor?.name || 'Unknown',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}