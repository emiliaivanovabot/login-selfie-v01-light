// EMERGENCY HEALTH CHECK API
// Diagnoses environment configuration for revenue recovery

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🚨 EMERGENCY HEALTH CHECK - Diagnosing production environment')

    // Check critical environment variables
    const envCheck = {
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_PUBLISHABLE_KEY: !!process.env.STRIPE_PUBLISHABLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      timestamp: new Date().toISOString(),
      emergency_mode: true
    }

    // Test file system write capability
    let canWriteFiles = false
    try {
      const fs = require('fs')
      const testFile = '/tmp/health_check_test.txt'
      fs.writeFileSync(testFile, 'test')
      fs.unlinkSync(testFile)
      canWriteFiles = true
    } catch (error) {
      console.warn('Cannot write to /tmp:', error)
    }

    const response = {
      status: 'emergency_mode',
      message: 'Emergency revenue recovery system active',
      environment: envCheck,
      capabilities: {
        file_system_write: canWriteFiles,
        stripe_configured: envCheck.STRIPE_SECRET_KEY && envCheck.STRIPE_PUBLISHABLE_KEY,
        database_configured: envCheck.DATABASE_URL
      },
      emergency_apis: {
        upload: '/api/upload - bypasses database',
        payment: '/api/create-payment-session - bypasses database',
        health: '/api/health - this endpoint'
      }
    }

    console.log('✅ Health check completed:', response)

    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Health check failed:', error)

    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}