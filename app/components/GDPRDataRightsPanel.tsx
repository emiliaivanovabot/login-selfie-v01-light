'use client'

// GDPR DATA RIGHTS MANAGEMENT PANEL
// Allows users to exercise their data protection rights

import { useState, useEffect } from 'react'
import {
  Shield,
  Download,
  Trash2,
  Eye,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface SessionData {
  sessionId: string
  consent: {
    data: boolean
    cookies: boolean
  }
  expiresAt: string
  dataProcessingActivities: Array<{
    action: string
    purpose: string
    legalBasis: string
    timestamp: string
  }>
}

export default function GDPRDataRightsPanel() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Load current session data
  useEffect(() => {
    loadSessionData()
  }, [])

  const loadSessionData = async () => {
    try {
      const response = await fetch('/api/gdpr/consent')
      const data = await response.json()

      if (data.hasConsent) {
        setSessionData(data)
      }
    } catch (error) {
      console.error('Failed to load session data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Export user data (GDPR Article 20)
  const handleDataExport = async () => {
    setActionLoading('export')
    setMessage(null)

    try {
      const response = await fetch('/api/gdpr/data-export')

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gdpr-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        setMessage({ type: 'success', text: 'Your data has been exported successfully' })
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  // Delete all user data (GDPR Article 17)
  const handleDataDeletion = async () => {
    if (!sessionData) return

    const confirmed = window.confirm(
      'Are you sure you want to delete all your data? This action cannot be undone and will:\n\n' +
      '• Delete your uploaded images\n' +
      '• Delete any generated images\n' +
      '• Delete your session information\n' +
      '• Delete all processing logs\n\n' +
      'You will need to start over if you want to use the service again.'
    )

    if (!confirmed) return

    setActionLoading('delete')
    setMessage(null)

    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          reason: 'user_request',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'All your data has been deleted successfully' })
        setSessionData(null)

        // Redirect to home after a short delay
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        throw new Error(data.error || 'Deletion failed')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete data. Please try again.' })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading your data...</span>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Session</h3>
        <p className="text-gray-600 mb-4">
          You don't have any active data processing sessions.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Start New Session
        </button>
      </div>
    )
  }

  const timeRemaining = new Date(sessionData.expiresAt).getTime() - Date.now()
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)))
  const minutesRemaining = Math.max(0, Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60)))

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Your Data & Privacy Rights</h2>
              <p className="text-gray-600">Manage your personal data according to GDPR</p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 border-b ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold mb-3">Current Session Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Automatic Deletion</span>
              </div>
              <p className="text-sm text-gray-600">
                Your data will be automatically deleted in{' '}
                <span className="font-semibold">
                  {hoursRemaining}h {minutesRemaining}m
                </span>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-medium">Consent Status</span>
              </div>
              <p className="text-sm text-gray-600">
                Data Processing: {sessionData.consent.data ? '✅ Granted' : '❌ Denied'}
              </p>
              <p className="text-sm text-gray-600">
                Cookies: {sessionData.consent.cookies ? '✅ Accepted' : '❌ Declined'}
              </p>
            </div>
          </div>
        </div>

        {/* GDPR Rights Actions */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold mb-4">Exercise Your Data Rights</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Right to Access/Export */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Export Your Data</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Download all personal data we have about you in a portable format.
              </p>
              <button
                onClick={handleDataExport}
                disabled={actionLoading === 'export'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'export' ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Exporting...
                  </span>
                ) : (
                  'Export Data'
                )}
              </button>
            </div>

            {/* Right to View Processing Activities */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-green-600" />
                <span className="font-medium">Processing Activities</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                View detailed log of how your data has been processed.
              </p>
              <button
                onClick={() => setShowActivities(!showActivities)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                View Activities
              </button>
            </div>

            {/* Right to Erasure */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="font-medium">Delete All Data</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete all your personal data from our systems.
              </p>
              <button
                onClick={handleDataDeletion}
                disabled={actionLoading === 'delete'}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === 'delete' ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Data'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Processing Activities Log */}
        {showActivities && sessionData.dataProcessingActivities && (
          <div className="p-6">
            <h3 className="font-semibold mb-4">Data Processing Activities</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {sessionData.dataProcessingActivities.map((activity, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium capitalize">
                      {activity.action.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600">Purpose: {activity.purpose}</p>
                  <p className="text-gray-600">Legal basis: {activity.legalBasis}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <h3 className="font-semibold mb-2">Questions about your data?</h3>
          <p className="text-sm text-gray-600">
            Contact our Data Protection Officer:{' '}
            <a
              href="mailto:privacy@aiselfiegenerator.com"
              className="text-blue-600 hover:underline"
            >
              privacy@aiselfiegenerator.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// State for showing activities
const [showActivities, setShowActivities] = useState(false)