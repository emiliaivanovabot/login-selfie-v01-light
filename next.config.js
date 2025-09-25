/** @type {import('next').NextConfig} */
const nextConfig = {
  // GDPR-compliant configuration for EU deployment

  // Ensure strict security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },

  // Configure image optimization for uploaded content
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
        pathname: '**',
      },
    ],
    // Limit image sizes to prevent abuse
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable format optimization
    formats: ['image/webp'],
    // Limit to prevent storage bloat
    minimumCacheTTL: 86400, // 24 hours (matches GDPR retention)
  },

  // API routes configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : [])],
      bodySizeLimit: '10mb', // Match file upload limit
    },
  },

  // Output configuration for Vercel deployment
  output: 'standalone',

  // Environment variable validation
  env: {
    GDPR_DATA_RETENTION_HOURS: process.env.GDPR_DATA_RETENTION_HOURS || '24',
    GDPR_COOKIE_CONSENT_REQUIRED: process.env.GDPR_COOKIE_CONSENT_REQUIRED || 'true',
    GDPR_EU_DATA_RESIDENCY: process.env.GDPR_EU_DATA_RESIDENCY || 'true',
  },

  // Webpack configuration for security
  webpack: (config, { dev, isServer }) => {
    // Production-only security enhancements
    if (!dev) {
      // Remove source maps in production for security
      config.devtool = false

      // Add bundle analyzer in development
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
    }

    return config
  },

  // Redirect configuration for GDPR compliance
  async redirects() {
    return [
      {
        source: '/data-policy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/gdpr',
        destination: '/privacy-rights',
        permanent: true,
      },
    ]
  },

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint strict mode
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Compiler options for performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Power by header removal for security
  poweredByHeader: false,

  // Compression enabled
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Trailing slash handling
  trailingSlash: false,
}

module.exports = nextConfig