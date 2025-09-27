// GDPR-COMPLIANT DATABASE CLIENT
// Ensures all database operations respect data retention and privacy

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GDPR-compliant session management
export class GDPRSessionManager {

  // Create session with automatic expiry (24h)
  static async createSession(data: {
    sessionId?: string
    uploadedImage?: string
    originalFilename?: string
    fileType?: string
    fileSize?: number
    uploadTimestamp?: Date
    dataConsent: boolean
    cookieConsent?: boolean
    processingConsent?: boolean
    marketingConsent?: boolean
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED'
    ipAddress?: string
    userAgent?: string
  }) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const session = await prisma.generationSession.create({
      data: {
        sessionId: data.sessionId,
        uploadFilename: data.originalFilename,
        // Store base64 image temporarily in uploadPath field (will be processed)
        uploadPath: data.uploadedImage ? `temp:${data.uploadedImage}` : undefined,
        dataConsent: data.dataConsent,
        cookieConsent: data.cookieConsent ?? false,
        paymentStatus: data.paymentStatus as any ?? 'PENDING',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt,
      },
    })

    // Log data processing activity (GDPR Article 30)
    await this.logDataProcessing(session.sessionId, {
      action: 'session_created',
      purpose: 'user_session_management',
      legalBasis: 'consent',
      dataTypes: ['session_data', 'consent_preferences', 'image_data'],
    })

    return session
  }

  // Get active session (not expired)
  static async getActiveSession(sessionId: string) {
    const session = await prisma.generationSession.findFirst({
      where: {
        sessionId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        dataProcessingLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10, // Latest 10 activities
        },
      },
    })

    return session
  }

  // Update session with payment info
  static async updatePaymentStatus(sessionId: string, stripeSessionId: string, paymentStatus: 'PENDING' | 'PAID' | 'FAILED') {
    const session = await prisma.generationSession.update({
      where: { sessionId },
      data: {
        stripeSessionId,
        paymentStatus,
        // Extend session to 24h from payment if successful
        ...(paymentStatus === 'PAID' && {
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      },
    })

    await this.logDataProcessing(sessionId, {
      action: 'payment_processed',
      purpose: 'payment_processing',
      legalBasis: 'contract',
      dataTypes: ['payment_info', 'session_data'],
    })

    return session
  }

  // Log data processing for GDPR transparency
  static async logDataProcessing(sessionId: string, log: {
    action: string
    purpose: string
    legalBasis: string
    dataTypes: string[]
  }) {
    return await prisma.dataProcessingLog.create({
      data: {
        sessionId,
        action: log.action,
        purpose: log.purpose,
        legalBasis: log.legalBasis,
        dataTypes: log.dataTypes.join(','), // Convert array to comma-separated string
      },
    })
  }

  // GDPR Article 17 - Right to erasure
  static async requestDataDeletion(sessionId: string) {
    const verificationToken = require('uuid').v4()

    const deletionRequest = await prisma.dataDeletionRequest.create({
      data: {
        sessionId,
        verificationToken,
      },
    })

    await this.logDataProcessing(sessionId, {
      action: 'deletion_requested',
      purpose: 'gdpr_compliance',
      legalBasis: 'legal_obligation',
      dataTypes: ['all_session_data'],
    })

    return deletionRequest
  }

  // Execute data deletion (called by cleanup job or manual request)
  static async executeDataDeletion(sessionId: string) {
    const session = await prisma.generationSession.findUnique({
      where: { sessionId },
    })

    if (!session) return null

    // Delete physical files
    const fs = require('fs').promises
    const path = require('path')

    try {
      if (session.uploadPath) {
        await fs.unlink(path.join(process.cwd(), session.uploadPath))
      }
      if (session.generatedImagePath) {
        await fs.unlink(path.join(process.cwd(), session.generatedImagePath))
      }
    } catch (error) {
      console.warn('File deletion warning:', error)
    }

    // Delete database records (cascades to logs)
    await prisma.generationSession.delete({
      where: { sessionId },
    })

    // Update deletion request status
    await prisma.dataDeletionRequest.updateMany({
      where: { sessionId },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    })

    return true
  }

  // Automatic cleanup of expired sessions (called by cron job)
  static async cleanupExpiredSessions() {
    const expiredSessions = await prisma.generationSession.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
      select: { sessionId: true },
    })

    console.log(`GDPR Cleanup: Found ${expiredSessions.length} expired sessions`)

    for (const session of expiredSessions) {
      await this.executeDataDeletion(session.sessionId)
    }

    return expiredSessions.length
  }
}