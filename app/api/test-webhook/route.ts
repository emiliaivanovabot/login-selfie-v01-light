// WEBHOOK TEST ENDPOINT
// For testing webhook configuration during development

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    console.log('🎣 Webhook Test Received:')
    console.log('Body length:', body.length)
    console.log('Signature present:', !!signature)
    console.log('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET)

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({
        status: 'webhook_secret_missing',
        message: 'STRIPE_WEBHOOK_SECRET environment variable not configured',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    if (!signature) {
      return NextResponse.json({
        status: 'signature_missing',
        message: 'stripe-signature header is missing',
        timestamp: new Date().toISOString()
      }, { status: 400 })
    }

    return NextResponse.json({
      status: 'webhook_ready',
      message: 'Webhook endpoint is configured and ready to receive events',
      timestamp: new Date().toISOString(),
      config: {
        webhookSecretConfigured: true,
        signatureReceived: true,
        endpoint: '/api/stripe/webhook'
      }
    })

  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Webhook test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'webhook_endpoint_active',
    message: 'Webhook test endpoint is running',
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    productionWebhookEndpoint: '/api/stripe/webhook',
    instructions: {
      step1: 'Configure STRIPE_WEBHOOK_SECRET in environment',
      step2: 'Set webhook URL in Stripe Dashboard to /api/stripe/webhook',
      step3: 'Test with actual webhook events from Stripe',
    },
    timestamp: new Date().toISOString()
  })
}