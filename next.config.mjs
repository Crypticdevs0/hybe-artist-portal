/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
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
    key: 'Permissions-Policy',
    value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self' https: data:; base-uri 'self'; font-src 'self' https: data:; img-src 'self' data: https:; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: ws:; frame-ancestors 'self';",
  },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: false,
    // Allow loading images from Vercel Blob and common external hosts.
    // In production, set VERCEL_BLOB_HOST env var to your blob host (e.g. "<org>.vercel-storage.com")
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.VERCEL_BLOB_HOST || 'public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
        pathname: '/**',
      },
    ],
  },
}

nextConfig.headers = async () => {
  return [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ]
}

export default withBundleAnalyzer(nextConfig)
