// GDPR-COMPLIANT LANDING PAGE
// Entry point with consent management and privacy-first design

import GDPRConsentBanner from './components/GDPRConsentBanner'
import PrivacyFirstUploadInterface from './components/PrivacyFirstUploadInterface'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Premium background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-transparent"></div>
      {/* GDPR Consent Banner - Shows on first visit */}
      <GDPRConsentBanner />

      {/* Premium Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center mr-3 shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                AI Selfie Generator
              </h1>
            </div>

            <nav className="flex space-x-6">
              <a href="/privacy-policy" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium">
                Privacy
              </a>
              <a href="/privacy-rights" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium">
                Your Rights
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Premium Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20">
          {/* Premium badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-300/20 rounded-full backdrop-blur-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-purple-200">Premium AI Technology • GDPR Compliant</span>
          </div>

          <h2 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 leading-tight">
            Create Professional
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Selfies
            </span>
          </h2>

          <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your photos with cutting-edge AI technology. Get studio-quality results in seconds with
            <span className="text-purple-300 font-semibold"> complete privacy protection</span> and automatic data deletion.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                GDPR Compliant
              </span>
            </div>
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                24h Auto-Delete
              </span>
            </div>
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mr-3 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-300 font-medium group-hover:text-white transition-colors duration-300">
                EU Data Servers
              </span>
            </div>
          </div>
        </div>

        {/* Premium Upload Interface */}
        <div className="relative max-w-4xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20 animate-pulse"></div>
          <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
            <PrivacyFirstUploadInterface />
          </div>
        </div>

        {/* Premium Privacy Information Section */}
        <div className="mt-20 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300/30 rounded-full backdrop-blur-sm">
                <svg className="w-5 h-5 text-purple-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-purple-200">Enterprise-Grade Security</span>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent mb-8">
                Your Privacy is Our Priority
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-gray-300">
              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors duration-300">Secure Processing</h4>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">Your images are processed on secure, EU-based servers with military-grade end-to-end encryption.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-emerald-200 transition-colors duration-300">Automatic Deletion</h4>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">All data is automatically deleted after 24 hours. No long-term storage, no data mining, no tracking.</p>
              </div>

              <div className="group">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-4 group-hover:text-pink-200 transition-colors duration-300">Full Control</h4>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">Export your data, delete it instantly, or view exactly how it's processed - complete transparency.</p>
              </div>
            </div>

            <div className="mt-12">
              <a
                href="/privacy-rights"
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25"
              >
                <span className="relative z-10">Manage Your Data Rights</span>
                <svg className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-xl border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-bold text-white text-lg mb-6">Privacy & Data Protection</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="/privacy-policy" className="hover:text-purple-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Privacy Policy</a></li>
                <li><a href="/privacy-rights" className="hover:text-purple-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Your GDPR Rights</a></li>
                <li><a href="/terms" className="hover:text-purple-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Terms of Service</a></li>
                <li><a href="/cookie-policy" className="hover:text-purple-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Cookie Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-6">Support</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="mailto:support@aiselfiegenerator.com" className="hover:text-blue-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Contact Support</a></li>
                <li><a href="mailto:privacy@aiselfiegenerator.com" className="hover:text-blue-300 transition-colors duration-300 hover:translate-x-1 transform inline-block">Data Protection Officer</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white text-lg mb-6">Service Information</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center"><span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>EU-based data processing</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>GDPR compliant since day one</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>24-hour automatic data deletion</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>End-to-end encryption</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2025 AI Selfie Generator. Built with privacy by design. <span className="text-purple-300">GDPR compliant.</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}