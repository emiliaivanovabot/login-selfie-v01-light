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
    <div className="max-w-2xl mx-auto">
      {/* Premium Privacy Notice Header */}
      <div className="relative group mb-8">
        {/* Premium glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Privacy-First Processing</h3>
          </div>
          <div className="text-gray-300 space-y-3">
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover/item:scale-110">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="group-hover/item:text-white transition-colors duration-300">Your image will be automatically deleted after 24 hours</span>
            </div>
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover/item:scale-110">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="group-hover/item:text-white transition-colors duration-300">Processing occurs in secure, EU-based servers</span>
            </div>
            <div className="flex items-center gap-3 group/item">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center transform transition-all duration-300 group-hover/item:scale-110">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <span className="group-hover/item:text-white transition-colors duration-300">You can request immediate deletion at any time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upload Area */}
      <div className="relative group mb-8">
        {/* Premium glow effect for upload area */}
        <div className={`absolute -inset-1 bg-gradient-to-r rounded-3xl blur opacity-20 transition-all duration-500 ${
          dragActive
            ? 'from-purple-500 to-blue-500 opacity-40'
            : 'from-purple-600 to-blue-600 group-hover:opacity-30'
        }`}></div>

        <div
          className={`relative backdrop-blur-xl border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 ${
            dragActive
              ? 'bg-white/10 border-purple-400/60'
              : 'bg-white/5 border-white/20 hover:border-purple-400/40 hover:bg-white/8'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {!uploadState.preview ? (
            <div>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-500 ${
                dragActive
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 scale-110 rotate-6'
                  : 'bg-gradient-to-br from-gray-600 to-gray-700 group-hover:from-purple-500 group-hover:to-blue-500 group-hover:scale-110'
              }`}>
                <ImageIcon className="w-10 h-10 text-white" />
              </div>

              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-3">
                Upload your selfie for AI generation
              </h3>
              <p className="text-gray-300 mb-8 text-lg">
                Drag and drop your image here, or click to select
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="group/btn relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Upload className="w-5 h-5" />
                  Choose File
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />

              <div className="mt-8 text-gray-400 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Supported: JPG, PNG, GIF • Max size: 10MB
                </p>
                <p className="flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Best results: Clear face, good lighting, 1:1 aspect ratio
                </p>
              </div>
            </div>
        ) : (
          <div className="space-y-8">
            {/* Premium Image Preview */}
            <div className="relative group/preview">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30"></div>
              <div className="relative inline-block">
                <img
                  src={uploadState.preview}
                  alt="Preview"
                  className="max-w-sm max-h-64 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl transform transition-all duration-500 group-hover/preview:scale-105"
                />
                <button
                  onClick={handleClear}
                  className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:from-red-600 hover:to-pink-700 transform transition-all duration-300 hover:scale-110 hover:rotate-12 shadow-2xl"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Premium File Info */}
            <div className="text-gray-300 space-y-2 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="font-medium">File: {uploadState.file?.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Size: {((uploadState.file?.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>

            {/* Premium Privacy Confirmation */}
            <div className="relative group/privacy">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl blur opacity-20 group-hover/privacy:opacity-30 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-xl border border-emerald-400/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover/privacy:scale-110 group-hover/privacy:rotate-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-200 to-green-200 bg-clip-text text-transparent">Ready for secure processing</span>
                </div>
                <ul className="text-emerald-100 space-y-2 ml-16">
                  <li className="flex items-center gap-3 group/item">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="group-hover/item:text-white transition-colors duration-300">Image will be processed using AI on secure servers</span>
                  </li>
                  <li className="flex items-center gap-3 group/item">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="group-hover/item:text-white transition-colors duration-300">Your original and generated images are automatically deleted after 24 hours</span>
                  </li>
                  <li className="flex items-center gap-3 group/item">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="group-hover/item:text-white transition-colors duration-300">Processing occurs within EU jurisdiction for GDPR compliance</span>
                  </li>
                  <li className="flex items-center gap-3 group/item">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="group-hover/item:text-white transition-colors duration-300">You can request immediate deletion at any time</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Generate Button */}
            <button
              onClick={handleUpload}
              disabled={uploadState.uploading}
              className="group/gen relative w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white px-8 py-5 rounded-2xl font-bold text-lg shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-700 opacity-0 group-hover/gen:opacity-100 transition-opacity duration-300"></div>

              {uploadState.uploading ? (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                    Uploading securely...
                  </span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Upload className="w-6 h-6 transform transition-transform duration-300 group-hover/gen:scale-110" />
                  <span className="bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                    Generate AI Selfie - €5.00
                  </span>
                </span>
              )}
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Premium Error Display */}
      {uploadState.error && (
        <div className="relative group animate-in slide-in-from-top duration-500">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-40"></div>
          <div className="relative bg-red-500/10 backdrop-blur-xl border border-red-400/30 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-red-200">Upload Error</span>
            </div>
            <p className="text-red-100 leading-relaxed pl-14">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Premium GDPR Rights Footer */}
      <div className="relative group/footer">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur"></div>
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="text-center space-y-6">
            <div className="flex flex-wrap justify-center gap-8">
              <button className="group flex items-center gap-3 text-purple-300 hover:text-white transition-all duration-300 hover:scale-110 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:border-purple-400/30">
                <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full group-hover:animate-pulse shadow-lg"></div>
                <span className="font-medium">View my data</span>
              </button>
              <button className="group flex items-center gap-3 text-purple-300 hover:text-white transition-all duration-300 hover:scale-110 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:border-red-400/30">
                <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-full group-hover:animate-pulse shadow-lg"></div>
                <span className="font-medium">Delete my data</span>
              </button>
              <button className="group flex items-center gap-3 text-purple-300 hover:text-white transition-all duration-300 hover:scale-110 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 hover:border-blue-400/30">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full group-hover:animate-pulse shadow-lg"></div>
                <span className="font-medium">Export my data</span>
              </button>
            </div>
            <p className="text-gray-400 text-lg">
              Questions? Contact our{' '}
              <a href="mailto:privacy@aiselfiegenerator.com" className="text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text hover:from-white hover:to-purple-200 transition-all duration-300 font-semibold">
                Data Protection Officer
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}