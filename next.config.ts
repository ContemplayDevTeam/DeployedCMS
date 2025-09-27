import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Performance optimizations */
  serverExternalPackages: ['airtable', 'cloudinary'],

  // Image optimization
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: false,
  },

  // PWA and caching
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
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['framer-motion', 'react-dropzone'],
  },

  // Compression
  compress: true,

  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dyeywnxdi',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '318978326338597',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'cpIAVTVJEFRIS06E2n_ZB4Gj1Qw'
  }
};

export default nextConfig;
