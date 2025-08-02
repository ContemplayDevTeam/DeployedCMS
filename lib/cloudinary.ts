import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary using the URL format
const cloudinaryUrl = process.env.CLOUDINARY_URL || 'cloudinary://318978326338597:cpIAVTVJEFRIS06E2n_ZB4Gj1Qw@dyeywnxdi'

// Parse the URL to get credentials
const url = new URL(cloudinaryUrl)
const apiKey = url.username
const apiSecret = url.password
const cloudName = url.hostname

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export default cloudinary

// Helper function to upload image to Cloudinary
export async function uploadImageToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string
        const base64Image = base64Data.split(',')[1] // Remove data:image/...;base64, prefix
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64Image}`,
          {
            folder: 'airtable-queue',
            resource_type: 'auto',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          }
        )
        
        resolve(result.secure_url)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
} 