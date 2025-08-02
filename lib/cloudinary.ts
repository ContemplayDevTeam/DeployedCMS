import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary using individual environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dyeywnxdi'
const apiKey = process.env.CLOUDINARY_API_KEY || '318978326338597'
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'cpIAVTVJEFRIS06E2n_ZB4Gj1Qw'

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
})

export default cloudinary

// Helper function to upload image to Cloudinary
export async function uploadImageToCloudinary(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('📖 Starting file read for:', file.name)
    
    // Convert file to base64
    const reader = new FileReader()
    
    reader.onload = async () => {
      try {
        console.log('📖 File read completed, converting to base64...')
        const base64Data = reader.result as string
        
        if (!base64Data) {
          throw new Error('FileReader result is empty')
        }
        
        const base64Image = base64Data.split(',')[1] // Remove data:image/...;base64, prefix
        
        if (!base64Image) {
          throw new Error('Failed to extract base64 data from file')
        }
        
        console.log('📖 Base64 conversion successful, length:', base64Image.length)
        console.log('☁️ Starting Cloudinary upload...')
        
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
        
        console.log('☁️ Cloudinary upload successful:', result.secure_url)
        resolve(result.secure_url)
      } catch (error) {
        console.error('💥 Cloudinary upload error:', error)
        
        if (error instanceof Error) {
          console.error('📋 Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
        }
        
        reject(error)
      }
    }
    
    reader.onerror = (event) => {
      console.error('💥 FileReader error:', event)
      reject(new Error(`Failed to read file: ${event.type}`))
    }
    
    reader.onabort = () => {
      console.error('💥 FileReader aborted')
      reject(new Error('File reading was aborted'))
    }
    
    console.log('📖 Starting file read...')
    reader.readAsDataURL(file)
  })
} 