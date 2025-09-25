// PAYMENT SUCCESS PAGE
// Shows confirmation after successful payment and redirects to generation

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface PaymentStatus {
  success: boolean
  message: string
  appSessionId?: string
}

function PaymentSuccessContent() {
  const [status, setStatus] = useState<PaymentStatus | null>(null)
  const [countdown, setCountdown] = useState(5)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const stripeSessionId = searchParams.get('session_id')
    const appSessionId = searchParams.get('app_session')

    if (!stripeSessionId || !appSessionId) {
      setStatus({
        success: false,
        message: 'Missing payment information. Please try again.',
      })
      return
    }

    // Verify payment status
    verifyPayment(stripeSessionId, appSessionId)
  }, [searchParams])

  useEffect(() => {
    // Countdown and redirect
    if (status?.success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status?.success && countdown === 0) {
      router.push(`/?session=${status.appSessionId}`)
    }
  }, [status, countdown, router])

  const verifyPayment = async (stripeSessionId: string, appSessionId: string) => {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeSessionId, appSessionId }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus({
          success: true,
          message: 'Payment confirmed! You can now generate your AI selfie.',
          appSessionId,
        })
      } else {
        setStatus({
          success: false,
          message: data.error || 'Payment verification failed.',
        })
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus({
        success: false,
        message: 'Unable to verify payment. Please contact support.',
      })
    }
  }

  if (!status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-800">
              Verifying Payment
            </h1>
            <p className="text-gray-600 text-center">
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-6">
            <CheckCircle className="w-16 h-16 text-green-600" />

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                {status.message}
              </p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                Redirecting to generation page in:
              </p>
              <div className="text-3xl font-bold text-blue-600">
                {countdown}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>

            <button
              onClick={() => router.push(`/?session=${status.appSessionId}`)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-600" />

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">
              Payment Issue
            </h1>
            <p className="text-gray-600">
              {status.message}
            </p>
          </div>

          <div className="flex space-x-4 w-full">
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}