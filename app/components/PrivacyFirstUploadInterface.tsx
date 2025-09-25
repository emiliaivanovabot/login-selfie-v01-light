'use client'

// PRIVACY-FIRST UPLOAD INTERFACE
// Transparent about data processing with clear privacy controls

import { useState, useCallback, useRef } from 'react'
import { Upload, Image as ImageIcon, Shield, Clock, Trash2, AlertCircle, CheckCircle } from 'lucide-react'

interface UploadState {
  file: File | null
  preview: string | null
  uploading: boolean
  error: string | null
  sessionId: string | null
}

export default function PrivacyFirstUploadInterface() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    error: null,
    sessionId: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadState(prev => ({
        ...prev,
        error: 'Please select a valid image file (JPG, PNG, GIF)',
      }))
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setUploadState(prev => ({
        ...prev,
        error: 'File size must be less than 10MB',
      }))
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadState(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        error: null,
      }))
    }
    reader.readAsDataURL(file)
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  // Handle payment redirect
  const handlePaymentRedirect = async (sessionId: string) => {
    try {
      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok && data.paymentUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.paymentUrl
      } else {
        throw new Error(data.error || 'Failed to create payment session')
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Payment setup failed. Please try again.',
      }))
    }
  }

  // Upload file with privacy controls
  const handleUpload = async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({ ...prev, uploading: true, error: null }))

    try {
      const formData = new FormData()
      formData.append('file', uploadState.file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          sessionId: data.sessionId,
        }))

        // Create payment session and redirect
        await handlePaymentRedirect(data.sessionId)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      }))
    }
  }

  // Clear selection
  const handleClear = () => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      error: null,
      sessionId: null,
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Privacy Notice Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Privacy-First Processing</h3>
        </div>
        <div className="text-sm text-blue-800 space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Your image will be automatically deleted after 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>Processing occurs in secure, EU-based servers</span>
          </div>
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>You can request immediate deletion at any time</span>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        {!uploadState.preview ? (
          <div
            className={`transition-colors ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload your selfie for AI generation
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your image here, or click to select
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Choose File
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="mt-4 text-sm text-gray-500">
              <p>Supported: JPG, PNG, GIF • Max size: 10MB</p>
              <p>Best results: Clear face, good lighting, 1:1 aspect ratio</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative inline-block">
              <img
                src={uploadState.preview}
                alt="Preview"
                className="max-w-sm max-h-64 rounded-lg shadow-md"
              />
              <button
                onClick={handleClear}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* File Info */}
            <div className="text-sm text-gray-600">
              <p>File: {uploadState.file?.name}</p>
              <p>Size: {((uploadState.file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            {/* Privacy Confirmation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Ready for secure processing</span>
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Image will be processed using AI on secure servers</li>
                <li>• Your original and generated images are automatically deleted after 24 hours</li>
                <li>• Processing occurs within EU jurisdiction for GDPR compliance</li>
                <li>• You can request immediate deletion at any time</li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleUpload}
              disabled={uploadState.uploading}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploadState.uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading securely...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Generate AI Selfie - €5.00
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-900">Upload Error</span>
          </div>
          <p className="text-sm text-red-800 mt-1">{uploadState.error}</p>
        </div>
      )}

      {/* GDPR Rights Footer */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Your privacy rights: {' '}
          <button className="text-blue-600 hover:underline">View my data</button>
          {' • '}
          <button className="text-blue-600 hover:underline">Delete my data</button>
          {' • '}
          <button className="text-blue-600 hover:underline">Export my data</button>
        </p>
        <p className="mt-1">
          Questions? Contact our{' '}
          <a href="mailto:privacy@aiselfiegenerator.com" className="text-blue-600 hover:underline">
            Data Protection Officer
          </a>
        </p>
      </div>
    </div>
  )
}