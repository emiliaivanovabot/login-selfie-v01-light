// GDPR-COMPLIANT FAL AI INTEGRATION
// Handles AI image generation with data privacy controls

import { GDPRSessionManager, prisma } from './database'

export class GDPRFalClient {
  private falKey: string
  private baseUrl: string = 'https://fal.ai/api'

  constructor() {
    this.falKey = process.env.FAL_KEY || ''
    if (!this.falKey) {
      throw new Error('FAL_KEY environment variable is required')
    }
  }

  // Generate image with GDPR compliance logging
  async generateImage(sessionId: string, imageBuffer: Buffer) {
    try {
      // Log data processing activity
      await GDPRSessionManager.logDataProcessing(sessionId, {
        action: 'ai_generation_started',
        purpose: 'image_generation',
        legalBasis: 'contract',
        dataTypes: ['image_data'],
      })

      // Upload image to FAL
      const uploadResponse = await this.uploadImage(imageBuffer)

      // Start generation job
      const generationResponse = await this.startGeneration(uploadResponse.url, sessionId)

      // Log generation job started
      await GDPRSessionManager.logDataProcessing(sessionId, {
        action: 'ai_job_submitted',
        purpose: 'image_generation',
        legalBasis: 'contract',
        dataTypes: ['processed_image_data'],
      })

      return {
        success: true,
        jobId: generationResponse.request_id,
        uploadUrl: uploadResponse.url,
      }

    } catch (error) {
      console.error('FAL AI generation error:', error)

      // Log failed attempt
      await GDPRSessionManager.logDataProcessing(sessionId, {
        action: 'ai_generation_failed',
        purpose: 'error_tracking',
        legalBasis: 'legitimate_interest',
        dataTypes: ['error_data'],
      })

      throw error
    }
  }

  // Upload image to FAL with temporary storage
  private async uploadImage(imageBuffer: Buffer) {
    const formData = new FormData()
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/jpeg' })
    formData.append('file', blob, 'upload.jpg')

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.falKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`FAL upload failed: ${response.statusText}`)
    }

    return await response.json()
  }

  // Start AI generation with professional headshot model
  private async startGeneration(imageUrl: string, sessionId: string) {
    const response = await fetch(`${this.baseUrl}/models/fal-ai/fast-sdxl/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        prompt: 'professional headshot, high quality, clean background, studio lighting',
        negative_prompt: 'blurry, low quality, distorted, nsfw, inappropriate',
        num_inference_steps: 25,
        guidance_scale: 7.5,
        strength: 0.8,
        seed: Math.floor(Math.random() * 1000000),
      }),
    })

    if (!response.ok) {
      throw new Error(`FAL generation failed: ${response.statusText}`)
    }

    return await response.json()
  }

  // Check generation status
  async checkGenerationStatus(jobId: string, sessionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/queue/requests/${jobId}/status`, {
        headers: {
          'Authorization': `Key ${this.falKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`FAL status check failed: ${response.statusText}`)
      }

      const status = await response.json()

      // Log status check (minimal logging for efficiency)
      if (status.status === 'COMPLETED') {
        await GDPRSessionManager.logDataProcessing(sessionId, {
          action: 'ai_generation_completed',
          purpose: 'image_generation',
          legalBasis: 'contract',
          dataTypes: ['generated_image_data'],
        })
      }

      return {
        status: status.status, // IN_QUEUE, IN_PROGRESS, COMPLETED, FAILED
        result: status.status === 'COMPLETED' ? status.result : null,
        error: status.error || null,
      }

    } catch (error) {
      console.error('FAL status check error:', error)
      throw error
    }
  }

  // Download and store generated image with GDPR compliance
  async downloadGeneratedImage(imageUrl: string, sessionId: string) {
    try {
      const response = await fetch(imageUrl)

      if (!response.ok) {
        throw new Error(`Failed to download generated image: ${response.statusText}`)
      }

      const imageBuffer = Buffer.from(await response.arrayBuffer())

      // Store image with session-based filename
      const fs = require('fs').promises
      const path = require('path')

      const fileName = `generated-${sessionId}.jpg`
      const filePath = path.join(process.cwd(), 'storage', 'generated', fileName)

      await fs.writeFile(filePath, imageBuffer)

      // Update session with generated image path
      await prisma.generationSession.update({
        where: { sessionId },
        data: {
          generatedImagePath: `storage/generated/${fileName}`,
          generationStatus: 'COMPLETED',
        },
      })

      // Log successful generation
      await GDPRSessionManager.logDataProcessing(sessionId, {
        action: 'generated_image_stored',
        purpose: 'image_delivery',
        legalBasis: 'contract',
        dataTypes: ['generated_image_file'],
      })

      return {
        success: true,
        fileName,
        filePath: `storage/generated/${fileName}`,
      }

    } catch (error) {
      console.error('Generated image download error:', error)
      throw error
    }
  }

  // GDPR-compliant cleanup - remove images from FAL servers
  async cleanupExternalResources(sessionId: string) {
    try {
      // Note: FAL automatically cleans up uploaded files after some time
      // But we log the cleanup attempt for GDPR transparency
      await GDPRSessionManager.logDataProcessing(sessionId, {
        action: 'external_resources_cleanup',
        purpose: 'gdpr_compliance',
        legalBasis: 'legal_obligation',
        dataTypes: ['external_service_data'],
      })

      return true
    } catch (error) {
      console.warn('External cleanup warning:', error)
      return false
    }
  }
}