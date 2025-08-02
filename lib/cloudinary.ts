import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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