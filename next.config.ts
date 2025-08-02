import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['airtable', 'cloudinary'],
  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
    CLOUDINARY_URL: process.env.CLOUDINARY_URL || 'cloudinary://318978326338597:cpIAVTVJEFRIS06E2n_ZB4Gj1Qw@dyeywnxdi'
  }
};

export default nextConfig;
