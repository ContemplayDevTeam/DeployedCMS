import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ['airtable', 'cloudinary'],
  env: {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY || '',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID || '',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || ''
  }
};

export default nextConfig;
