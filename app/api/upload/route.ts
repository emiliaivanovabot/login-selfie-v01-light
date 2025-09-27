// GDPR-COMPLIANT FILE UPLOAD API
// Handles secure file uploads with privacy controls and session management

import { NextRequest, NextResponse } from 'next/server'
import { GDPRSessionManager } from '@/app/lib/database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

// File validation schema
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images only.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Create new session for this upload
    const sessionId = randomUUID()

    // Convert file to base64 for temporary storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')

    // Store file data temporarily with GDPR session
    const session = await GDPRSessionManager.createSession({
      sessionId,
      uploadedImage: base64Data,
      originalFilename: file.name,
      fileType: file.type,
      fileSize: file.size,
      dataConsent: true, // Implied from upload action
      processingConsent: true,
      marketingConsent: false,
      paymentStatus: 'PENDING',
      uploadTimestamp: new Date(),
    })

    // Return session ID for payment processing
    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      message: 'File uploaded successfully and ready for processing'
    })

  } catch (error) {
    console.error('Upload error:', error)

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
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