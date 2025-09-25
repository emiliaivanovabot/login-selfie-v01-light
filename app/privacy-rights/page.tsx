// GDPR DATA RIGHTS MANAGEMENT PAGE
// Allows users to exercise their GDPR rights

// import GDPRDataRightsPanel from '../components/GDPRDataRightsPanel'

export const metadata = {
  title: 'Your Privacy Rights | AI Selfie Generator',
  description: 'Exercise your GDPR data protection rights - view, export, or delete your personal data',
}

export default function PrivacyRightsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold text-gray-900">
                AI Selfie Generator
              </a>
            </div>

            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </a>
              <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Title */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Your Privacy Rights</h1>
          <p className="mt-2 text-blue-100">
            Manage your personal data according to GDPR regulations
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-12">
        {/* <GDPRDataRightsPanel /> */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Rights Panel</h2>
          <p className="text-gray-600">Privacy rights management temporarily unavailable. Please contact support for assistance with your data rights requests.</p>
        </div>
      </main>

      {/* GDPR Information Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Rights Under GDPR</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Access (Article 15)</h3>
                <p className="text-gray-600">
                  You have the right to know what personal data we process about you and how we use it.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Rectification (Article 16)</h3>
                <p className="text-gray-600">
                  You can request correction of inaccurate personal data we hold about you.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Erasure (Article 17)</h3>
                <p className="text-gray-600">
                  You can request deletion of your personal data when it's no longer necessary for the purposes it was collected.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Data Portability (Article 20)</h3>
                <p className="text-gray-600">
                  You can export your personal data in a structured, commonly used format.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Object (Article 21)</h3>
                <p className="text-gray-600">
                  You can object to processing of your personal data in certain circumstances.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Right to Withdraw Consent (Article 7)</h3>
                <p className="text-gray-600">
                  You can withdraw your consent for data processing at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Our Commitment to Privacy</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Data is automatically deleted after 24 hours
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Processing occurs only within the EU
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No user accounts or long-term data storage
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Full transparency in data processing activities
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Questions about your privacy rights?{' '}
              <a
                href="mailto:privacy@aiselfiegenerator.com"
                className="text-blue-600 hover:underline font-medium"
              >
                Contact our Data Protection Officer
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}