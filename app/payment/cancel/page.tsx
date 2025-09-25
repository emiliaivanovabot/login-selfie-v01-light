// PAYMENT CANCEL PAGE
// Handles cancelled payments and provides options to retry

'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { useEffect, useState, Suspense } from 'react'

function PaymentCancelContent() {
  const [appSessionId, setAppSessionId] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const sessionId = searchParams.get('app_session')
    setAppSessionId(sessionId)
  }, [searchParams])

  const handleRetryPayment = () => {
    if (appSessionId) {
      // Redirect back to the main app with session to retry payment
      router.push(`/?session=${appSessionId}`)
    } else {
      // Start fresh session
      router.push('/')
    }
  }

  const handleStartOver = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          <XCircle className="w-16 h-16 text-yellow-600" />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Cancelled
            </h1>
            <p className="text-gray-600">
              Your payment was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 w-full">
            <h3 className="font-semibold text-yellow-800 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Your session is still active for a limited time</li>
              <li>• You can retry payment to continue</li>
              <li>• Your uploaded photo remains secure</li>
              <li>• Data will be deleted per GDPR compliance</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3 w-full">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CreditCard className="w-5 h-5" />
              <span>Retry Payment</span>
            </button>

            <button
              onClick={handleStartOver}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Start Over</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <PaymentCancelContent />
    </Suspense>
  )
}