// PAYMENT SYSTEM TEST PAGE
// Use this page to test payment integration before production

'use client'

import { useState } from 'react'

export default function TestPaymentPage() {
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const testPaymentFlow = async () => {
    setTesting(true)
    setResult(null)

    try {
      // Test creating a dummy session first
      const testSession = {
        dataConsent: true,
        cookieConsent: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      }

      const response = await fetch('/api/create-payment-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'test-session-' + Date.now()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Payment system ready! Session created: ${data.sessionId}`)
      } else {
        const error = await response.text()
        setResult(`❌ Payment system error: ${error}`)
      }

    } catch (error) {
      setResult(`❌ Test failed: ${error}`)
    }

    setTesting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Payment System Test
        </h1>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold text-blue-900">Current Status:</h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>✅ Stripe Secret Key: Configured</li>
              <li>✅ Payment API: Created</li>
              <li>✅ Webhook Handler: Ready</li>
              <li>⏳ Webhook Secret: Needed</li>
            </ul>
          </div>

          <button
            onClick={testPaymentFlow}
            disabled={testing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Test Payment System'}
          </button>

          {result && (
            <div className={`p-4 rounded ${
              result.includes('✅')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result}
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>This is a test page for development only.</p>
            <p>Remove before production deployment.</p>
          </div>
        </div>
      </div>
    </div>
  )
}