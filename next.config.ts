import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['airtable', 'cloudinary'],
  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dyeywnxdi',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '318978326338597',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'cpIAVTVJEFRIS06E2n_ZB4Gj1Qw'
  }
};

export default nextConfig;
