// GDPR ARTICLE 20 - RIGHT TO DATA PORTABILITY
// Allows users to export their data

import { NextRequest, NextResponse } from 'next/server'
import { GDPRSessionManager } from '@/app/lib/database'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('gdpr-session')?.value

    if (!sessionId) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 401 }
      )
    }

    const session = await GDPRSessionManager.getActiveSession(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 404 }
      )
    }

    // Prepare GDPR-compliant data export
    const exportData = {
      dataExport: {
        exportDate: new Date().toISOString(),
        sessionId: session.sessionId,
        dataRetention: '24 hours from creation',

        // Session information
        sessionData: {
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
          dataConsent: session.dataConsent,
          cookieConsent: session.cookieConsent,
        },

        // Payment information (if any)
        paymentData: session.stripeSessionId ? {
          paymentStatus: session.paymentStatus,
          stripeSessionId: session.stripeSessionId,
        } : null,

        // Generation status
        generationData: {
          status: session.generationStatus,
          downloadCount: session.downloadCount,
          maxDownloads: session.maxDownloads,
        },

        // Data processing activities (GDPR transparency)
        processingActivities: session.dataProcessingLogs?.map((log: any) => ({
          action: log.action,
          purpose: log.purpose,
          legalBasis: log.legalBasis,
          dataTypes: log.dataTypes,
          timestamp: log.timestamp,
        })),

        // GDPR rights information
        yourRights: {
          rightToAccess: 'You can access your personal data',
          rightToRectification: 'You can correct inaccurate personal data',
          rightToErasure: 'You can request deletion of your data',
          rightToPortability: 'You can export your data (this export)',
          rightToObject: 'You can object to processing',
          rightToWithdrawConsent: 'You can withdraw consent at any time',
        },

        // Contact information for data protection
        dataController: {
          name: 'AI Selfie Generator',
          email: 'privacy@aiselfiegenerator.com',
          dataProtectionOfficer: 'dpo@aiselfiegenerator.com',
        },
      },
    }

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gdpr-data-export-${sessionId}.json"`,
      },
    })

  } catch (error) {
    console.error('GDPR data export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}