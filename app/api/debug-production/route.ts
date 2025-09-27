// PRODUCTION DEBUGGING ENDPOINT - EMERGENCY DIAGNOSTIC
// DO NOT DEPLOY TO PRODUCTION WITHOUT REMOVING SENSITIVE DATA

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Environment variable check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      STRIPE_SECRET_KEY_EXISTS: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_SECRET_KEY_PREFIX: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '***',
      STRIPE_PUBLISHABLE_KEY_EXISTS: !!process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET_EXISTS: !!process.env.STRIPE_WEBHOOK_SECRET,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      FAL_KEY_EXISTS: !!process.env.FAL_KEY,
    }

    // Test Stripe initialization
    let stripeTest = 'NOT_TESTED'
    try {
      const Stripe = require('stripe')
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: '2024-06-20',
          timeout: 5000, // Quick test
        })
        stripeTest = 'INITIALIZED_SUCCESS'
      } else {
        stripeTest = 'NO_SECRET_KEY'
      }
    } catch (error) {
      stripeTest = `INIT_ERROR: ${error instanceof Error ? error.message : 'Unknown'}`
    }

    // URL generation test
    const urlTest = {
      production: process.env.NODE_ENV === 'production',
      vercelUrl: process.env.VERCEL_URL,
      successUrl: process.env.NODE_ENV === 'production'
        ? `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://login-selfie-v01-light.vercel.app'}/payment/success`
        : 'http://localhost:3000/payment/success',
      cancelUrl: process.env.NODE_ENV === 'production'
        ? `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://login-selfie-v01-light.vercel.app'}/payment/cancel`
        : 'http://localhost:3000/payment/cancel',
    }

    // File system test
    let fsTest = 'NOT_TESTED'
    try {
      const fs = require('fs')
      const path = require('path')
      const testFile = path.join('/tmp', `debug_test_${Date.now()}.txt`)
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      fsTest = 'WRITE_READ_SUCCESS'
    } catch (error) {
      fsTest = `FS_ERROR: ${error instanceof Error ? error.message : 'Unknown'}`
    }

    // Memory and limits
    const systemInfo = {
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      status: 'PRODUCTION_DEBUG_REPORT',
      environment: envCheck,
      stripeInitialization: stripeTest,
      urlGeneration: urlTest,
      fileSystem: fsTest,
      system: systemInfo,
      warnings: [
        'This endpoint exposes sensitive information',
        'Remove before production deployment',
        'Only use for emergency debugging'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      status: 'DEBUG_ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

// Disable in production unless debugging
export async function POST() {
  return NextResponse.json({ error: 'Debug endpoint - GET only' }, { status: 405 })
}