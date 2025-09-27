'use client'

// GDPR CONSENT BANNER - First interaction with users
// Ensures compliance with GDPR Articles 6, 7, and Cookie Law

import { useState, useEffect } from 'react'
import { X, Shield, Cookie, Database, Eye } from 'lucide-react'

interface ConsentState {
  dataProcessing: boolean
  cookies: boolean
  analytics: boolean
}

export default function GDPRConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({
    dataProcessing: false,
    cookies: false,
    analytics: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if user already gave consent
    const checkConsentStatus = async () => {
      try {
        const response = await fetch('/api/gdpr/consent')
        const data = await response.json()

        if (!data.hasConsent) {
          setIsVisible(true)
        }
      } catch (error) {
        console.error('GDPR Banner: Failed to check consent status:', error)
        setIsVisible(true) // Show banner on error to be safe
      }
    }

    checkConsentStatus()
  }, [mounted])

  const handleConsentSubmission = async (acceptAll: boolean = false) => {
    setIsSubmitting(true)

    try {
      const consentData = acceptAll ? {
        dataConsent: true,
        cookieConsent: true,
        marketingConsent: false, // Keep marketing consent separate
      } : {
        dataConsent: consent.dataProcessing,
        cookieConsent: consent.cookies,
        marketingConsent: consent.analytics,
      }

      const response = await fetch('/api/gdpr/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consentData),
      })

      if (response.ok) {
        setIsVisible(false)
        // Refresh page to apply consent preferences
        window.location.reload()
      } else {
        throw new Error('Failed to save consent preferences')
      }
    } catch (error) {
      console.error('Consent submission error:', error)
      alert('Failed to save your privacy preferences. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent hydration mismatches by not rendering until mounted
  if (!mounted || !isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Privacy & Data Protection</h2>
                <p className="text-sm text-gray-600">We respect your privacy and comply with GDPR</p>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Toggle details"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              We need your consent to process your images and provide our AI generation service.
              Your data will be automatically deleted after 24 hours.
            </p>

            {showDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  What data we process:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 mb-4">
                  <li>• Your uploaded image (processed by AI, then deleted)</li>
                  <li>• Payment information (processed securely by Stripe)</li>
                  <li>• Session data (automatically expires in 24 hours)</li>
                  <li>• Basic security information (IP address for fraud prevention)</li>
                </ul>

                <h3 className="font-semibold mb-2">Your GDPR rights:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Right to access your data</li>
                  <li>• Right to delete your data at any time</li>
                  <li>• Right to export your data</li>
                  <li>• Right to object to processing</li>
                </ul>
              </div>
            )}
          </div>

          {/* Consent Options */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Image Processing</div>
                  <div className="text-sm text-gray-600">Required to generate your AI selfie</div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={consent.dataProcessing}
                  onChange={(e) => setConsent({ ...consent, dataProcessing: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                  required
                />
                <span className="ml-2 text-sm text-red-600">Required</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Cookie className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium">Essential Cookies</div>
                  <div className="text-sm text-gray-600">Required for session management and security</div>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={consent.cookies}
                  onChange={(e) => setConsent({ ...consent, cookies: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                  required
                />
                <span className="ml-2 text-sm text-red-600">Required</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Anonymous Analytics</div>
                  <div className="text-sm text-gray-600">Help us improve our service (optional)</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={consent.analytics}
                onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleConsentSubmission(true)}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Accept All & Continue'}
            </button>

            <button
              onClick={() => handleConsentSubmission(false)}
              disabled={isSubmitting || (!consent.dataProcessing || !consent.cookies)}
              className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save My Choices
            </button>

            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              {' '}and{' '}
              <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>.
              Data is automatically deleted after 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}