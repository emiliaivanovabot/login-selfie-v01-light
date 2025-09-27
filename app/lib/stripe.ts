// STRIPE CLIENT CONFIGURATION
// Handles secure payment processing for selfie generation service

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
})

// Payment configuration for selfie generation
export const PAYMENT_CONFIG = {
  SELFIE_PRICE: 500, // €5.00 in cents
  CURRENCY: 'eur',
  SUCCESS_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com/payment/success'
    : 'http://localhost:3000/payment/success',
  CANCEL_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com/payment/cancel'
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
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: PAYMENT_CONFIG.CURRENCY,
            product_data: {
              name: 'AI Selfie Generation',
              description: 'Generate a professional AI-enhanced selfie with GDPR compliance',
              images: [], // Add product images if needed
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
      } satisfies PaymentSessionMetadata,
      // GDPR compliance
      customer_creation: 'if_required',
      billing_address_collection: 'required',
      // Session expires in 30 minutes
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      // Custom branding
      custom_text: {
        submit: {
          message: 'Your payment is processed securely by Stripe. Data will be deleted within 24 hours per GDPR compliance.',
        },
      },
    })

    return session
  } catch (error) {
    console.error('Stripe session creation failed:', error)
    throw new Error('Failed to create payment session')
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