// GDPR-COMPLIANT LANDING PAGE
// Entry point with consent management and privacy-first design

import GDPRConsentBanner from './components/GDPRConsentBanner'
import PrivacyFirstUploadInterface from './components/PrivacyFirstUploadInterface'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* GDPR Consent Banner - Shows on first visit */}
      <GDPRConsentBanner />

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Selfie Generator</h1>
            </div>

            <nav className="flex space-x-4">
              <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
                Privacy
              </a>
              <a href="/privacy-rights" className="text-gray-600 hover:text-gray-900">
                Your Rights
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Create Professional AI Selfies
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your photo and get a professionally enhanced AI-generated selfie in seconds.
            Complete privacy protection with automatic data deletion after 24 hours.
          </p>

          <div className="mt-8 flex justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              GDPR Compliant
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              24h Auto-Delete
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              EU Data Servers
            </div>
          </div>
        </div>

        {/* Privacy-First Upload Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <PrivacyFirstUploadInterface />
        </div>

        {/* Privacy Information Section */}
        <div className="mt-16 bg-blue-50 rounded-xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">
              Your Privacy is Our Priority
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-blue-800">
              <div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Secure Processing</h4>
                <p className="text-sm">Your images are processed on secure, EU-based servers with end-to-end encryption.</p>
              </div>

              <div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h8a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zM6 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Automatic Deletion</h4>
                <p className="text-sm">All data is automatically deleted after 24 hours. No long-term storage, no data mining.</p>
              </div>

              <div>
                <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="font-semibold mb-2">Full Control</h4>
                <p className="text-sm">Export your data, delete it instantly, or view exactly how it's processed - your choice.</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="/privacy-rights"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Your Data Rights
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Privacy & Data Protection</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="/privacy-policy" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="/privacy-rights" className="hover:text-gray-900">Your GDPR Rights</a></li>
                <li><a href="/terms" className="hover:text-gray-900">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="mailto:support@aiselfiegenerator.com" className="hover:text-gray-900">Contact Support</a></li>
                <li><a href="mailto:privacy@aiselfiegenerator.com" className="hover:text-gray-900">Data Protection Officer</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Service Information</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🇪🇺 EU-based data processing</li>
                <li>🔒 GDPR compliant since day one</li>
                <li>⏰ 24-hour automatic data deletion</li>
                <li>🛡️ End-to-end encryption</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2025 AI Selfie Generator. Built with privacy by design. GDPR compliant.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}