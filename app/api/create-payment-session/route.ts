// EMERGENCY REVENUE FIX - DATABASE-FREE PAYMENT SESSION API
// Creates Stripe payment sessions without database dependency

import { NextRequest, NextResponse } from 'next/server'
import { createPaymentSession } from '@/app/lib/stripe'
import { z } from 'zod'

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

    // Check if session exists in temp file system
    let sessionExists = false
    try {
      const fs = require('fs')
      const path = require('path')
      const tempFile = path.join('/tmp', `session_${sessionId}.json`)

      if (fs.existsSync(tempFile)) {
        const sessionData = JSON.parse(fs.readFileSync(tempFile, 'utf8'))
        console.log(`✅ Found session in temp file: ${tempFile}`)
        sessionExists = true

        // Check if already paid
        if (sessionData.paymentStatus === 'PAID') {
          return NextResponse.json(
            { error: 'Session already paid' },
            { status: 400 }
          )
        }
      } else {
        console.log(`⚠️ Session temp file not found: ${tempFile}`)
      }
    } catch (error) {
      console.warn('⚠️ Could not check temp file, continuing anyway:', error)
    }

    // For emergency revenue recovery, allow payment even if session not found
    // This ensures Stripe payment window always opens
    if (!sessionExists) {
      console.log('⚠️ Session not found in temp files, but allowing payment for revenue recovery')
    }

    // Create Stripe payment session - with emergency fallback
    console.log('💳 About to call createPaymentSession...')

    let paymentSession
    try {
      paymentSession = await createPaymentSession(sessionId)
      console.log('✅ createPaymentSession succeeded via Stripe SDK')
    } catch (error) {
      console.error('💥 Stripe SDK failed, trying emergency proxy:', error)

      // EMERGENCY FALLBACK: Use direct HTTP call instead of proxy
      const proxyResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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
        }).toString(),
      })

      if (!proxyResponse.ok) {
        const errorText = await proxyResponse.text()
        console.error('💥 Direct HTTP fallback also failed:', errorText)
        throw new Error('Both Stripe SDK and direct HTTP failed')
      }

      const session = await proxyResponse.json()
      paymentSession = {
        id: session.id,
        url: session.url
      }
      console.log('✅ Direct HTTP fallback succeeded')
    }

    console.log(`✅ Stripe payment session created: ${paymentSession.id}`)
    console.log(`💰 Payment URL: ${paymentSession.url}`)

    // Try to update temp file with payment info
    try {
      const fs = require('fs')
      const path = require('path')
      const tempFile = path.join('/tmp', `session_${sessionId}.json`)

      if (fs.existsSync(tempFile)) {
        const sessionData = JSON.parse(fs.readFileSync(tempFile, 'utf8'))
        sessionData.stripeSessionId = paymentSession.id
        sessionData.paymentStatus = 'PENDING'
        sessionData.paymentCreated = new Date().toISOString()

        fs.writeFileSync(tempFile, JSON.stringify(sessionData))
        console.log(`✅ Updated temp file with payment info`)
      } else {
        // Create minimal session data for payment tracking
        const minimalSession = {
          sessionId,
          stripeSessionId: paymentSession.id,
          paymentStatus: 'PENDING',
          paymentCreated: new Date().toISOString(),
          emergencyMode: true
        }
        fs.writeFileSync(tempFile, JSON.stringify(minimalSession))
        console.log(`✅ Created minimal session for payment tracking`)
      }
    } catch (error) {
      console.warn('⚠️ Could not update temp file, but payment session created:', error)
    }

    // Return payment session URL - THIS IS CRITICAL FOR REVENUE
    return NextResponse.json({
      success: true,
      paymentUrl: paymentSession.url,
      sessionId: paymentSession.id,
      debug: {
        emergencyMode: true,
        timestamp: new Date().toISOString(),
        sessionExists
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
          emergencyMode: true
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