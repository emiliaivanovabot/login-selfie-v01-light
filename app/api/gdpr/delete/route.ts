// GDPR ARTICLE 17 - RIGHT TO ERASURE API
// Allows users to request deletion of their data

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GDPRSessionManager, prisma } from '@/app/lib/database'

const DeleteRequestSchema = z.object({
  sessionId: z.string().uuid(),
  reason: z.enum(['no_longer_needed', 'withdraw_consent', 'unlawful_processing', 'other']).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deleteRequest = DeleteRequestSchema.parse(body)

    // Verify session exists and user has access
    const sessionCookie = request.cookies.get('gdpr-session')?.value
    if (sessionCookie !== deleteRequest.sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized deletion request' },
        { status: 401 }
      )
    }

    // Check if session exists
    const session = await GDPRSessionManager.getActiveSession(deleteRequest.sessionId)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or already expired' },
        { status: 404 }
      )
    }

    // Create deletion request
    const deletionRequest = await GDPRSessionManager.requestDataDeletion(deleteRequest.sessionId)

    // Execute immediate deletion (for session-based data)
    await GDPRSessionManager.executeDataDeletion(deleteRequest.sessionId)

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Your data has been deleted as requested',
      deletedData: [
        'Session information',
        'Uploaded images',
        'Generated images',
        'Payment session data',
        'Processing logs',
      ],
      deletionId: deletionRequest.id,
      deletedAt: new Date().toISOString(),
    })

    response.cookies.delete('gdpr-session')

    return response

  } catch (error) {
    console.error('GDPR deletion error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process deletion request',
        code: 'DELETION_FAILED'
      },
      { status: 500 }
    )
  }
}

// Get deletion request status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const deletionId = url.searchParams.get('id')

    if (!deletionId) {
      return NextResponse.json(
        { error: 'Deletion ID required' },
        { status: 400 }
      )
    }

    const deletionRequest = await prisma.dataDeletionRequest.findUnique({
      where: { id: deletionId },
    })

    if (!deletionRequest) {
      return NextResponse.json(
        { error: 'Deletion request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: deletionRequest.id,
      sessionId: deletionRequest.sessionId,
      status: deletionRequest.status,
      requestedAt: deletionRequest.requestedAt,
      processedAt: deletionRequest.processedAt,
    })

  } catch (error) {
    console.error('GDPR deletion status error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve deletion status' },
      { status: 500 }
    )
  }
}