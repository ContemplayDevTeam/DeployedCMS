"use client";

import { CldImage } from 'next-cloudinary';

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function CloudinaryImage({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className = "" 
}: CloudinaryImageProps) {
  // Extract the public ID from the Cloudinary URL
  const getPublicId = (url: string) => {
    if (!url.includes('cloudinary.com')) {
      return url; // Return as-is if not a Cloudinary URL
    }
    
    // Extract public ID from URL like: https://res.cloudinary.com/dyeywnxdi/image/upload/v1234567890/airtable-queue/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      return parts.slice(uploadIndex + 2).join('/').split('.')[0]; // Remove file extension
    }
    return url;
  };

  const publicId = getPublicId(src);

  return (
    <CldImage
      src={publicId}
      width={width}
      height={height}
      alt={alt}
      className={className}
      crop="thumb"
      gravity="auto"
      quality="auto"
      format="auto"
    />
  );
} 