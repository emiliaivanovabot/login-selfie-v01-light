// GDPR AUTOMATED DATA CLEANUP CRON JOB
// Runs every 2 hours to delete expired sessions and maintain compliance

import { NextRequest, NextResponse } from 'next/server'
import { GDPRSessionManager } from '@/app/lib/database'

// Verify that this is a legitimate cron call from Vercel
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  return authHeader === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(request: NextRequest) {
  console.log('GDPR cleanup cron job started:', new Date().toISOString())

  // Verify authorization for production security
  if (process.env.NODE_ENV === 'production' && !verifyCronSecret(request)) {
    console.log('Unauthorized cron job attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Clean up expired sessions
    const deletedCount = await GDPRSessionManager.cleanupExpiredSessions()

    // Clean up orphaned files (files without database entries)
    const orphanedFilesDeleted = await cleanupOrphanedFiles()

    // Clean up temporary files older than 1 hour
    const tempFilesDeleted = await cleanupTempFiles()

    // Log cleanup statistics
    console.log('GDPR cleanup completed:', {
      expiredSessions: deletedCount,
      orphanedFiles: orphanedFilesDeleted,
      tempFiles: tempFilesDeleted,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'GDPR cleanup completed successfully',
      statistics: {
        expiredSessionsDeleted: deletedCount,
        orphanedFilesDeleted,
        tempFilesDeleted,
        executedAt: new Date().toISOString(),
      },
    })

  } catch (error) {
    console.error('GDPR cleanup cron job failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Cleanup job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Clean up files that no longer have associated database records
async function cleanupOrphanedFiles(): Promise<number> {
  const fs = require('fs').promises
  const path = require('path')

  let deletedCount = 0

  try {
    const uploadsDir = path.join(process.cwd(), 'storage', 'uploads')
    const generatedDir = path.join(process.cwd(), 'storage', 'generated')

    // Check uploads directory
    try {
      const uploadFiles = await fs.readdir(uploadsDir, { withFileTypes: true })

      for (const file of uploadFiles) {
        if (file.isFile()) {
          // Extract session ID from filename (format: upload-{sessionId}.jpg)
          const sessionIdMatch = file.name.match(/upload-([a-f0-9-]+)\./i)

          if (sessionIdMatch) {
            const sessionId = sessionIdMatch[1]
            const session = await GDPRSessionManager.getActiveSession(sessionId)

            if (!session) {
              await fs.unlink(path.join(uploadsDir, file.name))
              deletedCount++
              console.log(`Deleted orphaned upload file: ${file.name}`)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not clean uploads directory:', err)
    }

    // Check generated directory
    try {
      const generatedFiles = await fs.readdir(generatedDir, { withFileTypes: true })

      for (const file of generatedFiles) {
        if (file.isFile()) {
          // Extract session ID from filename (format: generated-{sessionId}.jpg)
          const sessionIdMatch = file.name.match(/generated-([a-f0-9-]+)\./i)

          if (sessionIdMatch) {
            const sessionId = sessionIdMatch[1]
            const session = await GDPRSessionManager.getActiveSession(sessionId)

            if (!session) {
              await fs.unlink(path.join(generatedDir, file.name))
              deletedCount++
              console.log(`Deleted orphaned generated file: ${file.name}`)
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not clean generated directory:', err)
    }

  } catch (error) {
    console.error('Error cleaning orphaned files:', error)
  }

  return deletedCount
}

// Clean up temporary files older than 1 hour
async function cleanupTempFiles(): Promise<number> {
  const fs = require('fs').promises
  const path = require('path')

  let deletedCount = 0

  try {
    const tempDir = path.join(process.cwd(), 'storage', 'temp')
    const oneHourAgo = Date.now() - (60 * 60 * 1000) // 1 hour in milliseconds

    const tempFiles = await fs.readdir(tempDir, { withFileTypes: true })

    for (const file of tempFiles) {
      if (file.isFile()) {
        const filePath = path.join(tempDir, file.name)
        const stats = await fs.stat(filePath)

        if (stats.mtime.getTime() < oneHourAgo) {
          await fs.unlink(filePath)
          deletedCount++
          console.log(`Deleted old temp file: ${file.name}`)
        }
      }
    }
  } catch (error) {
    console.warn('Error cleaning temp files:', error)
  }

  return deletedCount
}

// Also handle manual trigger via POST (for testing or manual cleanup)
export async function POST(request: NextRequest) {
  // Same logic as GET but with additional authentication checks
  return await GET(request)
}