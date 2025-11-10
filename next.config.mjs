/** @type {import('next').NextConfig} */
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
        hostname: process.env.VERCEL_BLOB_HOST || '*.vercel-storage.com',
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

export default nextConfig
