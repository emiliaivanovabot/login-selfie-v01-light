// STRIPE CLIENT CONFIGURATION
// Handles secure payment processing for selfie generation service

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil', // Must match webhook API version!
  typescript: true,
  timeout: 40000, // Longer timeout for Vercel Edge regions
  maxNetworkRetries: 0, // Disable Stripe's internal retries - we handle it
  // VERCEL FIX: Use Fetch HTTP Client instead of Node.js sockets
  httpClient: Stripe.createFetchHttpClient(),
  // Vercel serverless optimizations
  telemetry: false, // Reduce overhead
  stripeAccount: undefined, // Use default account
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

// VERCEL NETWORKING BYPASS
// Creates new Stripe instance with optimized settings for each call
function createVercelOptimizedStripe(): Stripe {
  const isVercel = !!process.env.VERCEL_URL

  if (isVercel) {
    console.log('🚀 Using Vercel-optimized Stripe configuration with Fetch HTTP Client')
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
      timeout: 60000, // Maximum timeout for Vercel
      maxNetworkRetries: 0, // Handle retries manually
      telemetry: false,
      // VERCEL FIX: Use Fetch HTTP Client for serverless compatibility
      httpClient: Stripe.createFetchHttpClient(),
    })
  }

  return stripe // Use default for local development
}

// VERCEL SERVERLESS RETRY MECHANISM
// Handles networking issues common in serverless environments
async function retryStripeCall<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: Error = new Error('No attempts made')

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Stripe API attempt ${attempt}/${maxRetries}`)

      // Add progressive delay between retries
      if (attempt > 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 2), 5000) // Max 5 seconds
        console.log(`⏳ Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Stripe API timeout after 25 seconds')), 25000)
        )
      ])

      console.log(`✅ Stripe API call succeeded on attempt ${attempt}`)
      return result

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      console.error(`❌ Stripe API attempt ${attempt} failed:`, lastError.message)

      // Don't retry on authentication errors
      if (lastError.message.includes('Invalid API Key') ||
          lastError.message.includes('authentication')) {
        throw lastError
      }

      // Don't retry on final attempt
      if (attempt === maxRetries) {
        break
      }
    }
  }

  console.error(`💥 All ${maxRetries} Stripe API attempts failed`)
  throw new Error(`Stripe API failed after ${maxRetries} attempts. Last error: ${lastError.message}`)
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
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8),
      vercelRegion: process.env.VERCEL_REGION || 'unknown',
      runtime: 'serverless'
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

    // VERCEL SERVERLESS FIX: Use optimized Stripe instance with retry logic
    const stripeClient = createVercelOptimizedStripe()
    const session = await retryStripeCall(() =>
      stripeClient.checkout.sessions.create(sessionConfig)
    )

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