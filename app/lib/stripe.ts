// STRIPE CLIENT CONFIGURATION
// Handles secure payment processing for selfie generation service

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', // Must match webhook API version!
  typescript: true,
  timeout: 20000, // 20 seconds timeout for serverless
  maxNetworkRetries: 3, // More retries for connectivity
  httpAgent: undefined, // Let Stripe handle connections
})

// Payment configuration for selfie generation
export const PAYMENT_CONFIG = {
  SELFIE_PRICE: 500, // €5.00 in cents
  CURRENCY: 'eur',
  SUCCESS_URL: process.env.NODE_ENV === 'production'
    ? 'https://login-selfie-v01-light.vercel.app/payment/success'
    : 'http://localhost:3000/payment/success',
  CANCEL_URL: process.env.NODE_ENV === 'production'
    ? 'https://login-selfie-v01-light.vercel.app/payment/cancel'
    : 'http://localhost:3000/payment/cancel',
} as const

export interface PaymentSessionMetadata {
  sessionId: string
  service: 'selfie_generation'
  gdprConsent: string
}

// Create payment session for selfie generation
export async function createPaymentSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    console.log('🔧 Creating Stripe session with config:', {
      sessionId,
      price: PAYMENT_CONFIG.SELFIE_PRICE,
      currency: PAYMENT_CONFIG.CURRENCY,
      successUrl: PAYMENT_CONFIG.SUCCESS_URL,
      cancelUrl: PAYMENT_CONFIG.CANCEL_URL,
      env: process.env.NODE_ENV,
      stripeKeyExists: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8)
    })

    // Validate environment
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    // Minimal session creation for serverless reliability
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: PAYMENT_CONFIG.CURRENCY,
            product_data: {
              name: 'AI Selfie Generation',
              description: 'Professional AI selfie with GDPR compliance',
            },
            unit_amount: PAYMENT_CONFIG.SELFIE_PRICE,
          },
          quantity: 1,
        },
      ],
      success_url: `${PAYMENT_CONFIG.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}&app_session=${sessionId}`,
      cancel_url: `${PAYMENT_CONFIG.CANCEL_URL}?app_session=${sessionId}`,
      metadata: {
        sessionId,
        service: 'selfie_generation',
        gdprConsent: 'true',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    }

    console.log('🔧 About to call Stripe API...')
    console.log('🔧 Session config:', JSON.stringify(sessionConfig, null, 2))

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('✅ Stripe session created successfully:', {
      id: session.id,
      url: session.url,
      status: session.status
    })

    return session
  } catch (error) {
    console.error('💥 Stripe session creation failed:', error)
    console.error('💥 Error type:', error?.constructor?.name)
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error')

    if (error instanceof Error) {
      console.error('💥 Error stack:', error.stack)
    }

    // Log Stripe-specific error details
    if ((error as any)?.type) {
      console.error('💥 Stripe error details:', {
        type: (error as any).type,
        code: (error as any).code,
        param: (error as any).param,
        statusCode: (error as any).statusCode,
        message: (error as any).message,
        request_id: (error as any).request_id
      })
    }

    throw new Error(`Failed to create payment session: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Verify webhook signature for security
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid webhook signature')
  }
}

// Retrieve payment session details
export async function getPaymentSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    })
  } catch (error) {
    console.error('Failed to retrieve payment session:', error)
    throw new Error('Payment session not found')
  }
}