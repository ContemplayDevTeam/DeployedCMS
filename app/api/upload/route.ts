import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

// Helper function for retrying network requests with exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error: unknown) {
      lastError = error

      // Check if it's a network error that we should retry
      const isRetryableError =
        (error as { cause?: { code?: string } })?.cause?.code === 'ECONNRESET' ||
        (error as { cause?: { code?: string } })?.cause?.code === 'ETIMEDOUT' ||
        (error as { cause?: { code?: string } })?.cause?.code === 'ENOTFOUND' ||
        (error as { message?: string })?.message?.includes('fetch failed') ||
        (error as { message?: string })?.message?.includes('network')

      if (!isRetryableError || attempt === maxRetries) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) // Exponential backoff
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries} in ${delay}ms due to: ${(error as { cause?: { code?: string } })?.cause?.code || (error as { message?: string })?.message}`)

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export async function POST(request: NextRequest) {
  console.log('🚀 Upload route called')
  
  try {
    // Check if request has form data
    const contentType = request.headers.get('content-type')
    console.log('📋 Content-Type:', contentType)
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.error('❌ Invalid content type:', contentType)
      return NextResponse.json(
        { 
          error: 'Invalid content type. Expected multipart/form-data',
          receivedContentType: contentType 
        },
        { status: 400 }
      )
    }

    // Parse form data safely
    console.log('📝 Parsing form data...')
    const formData = await request.formData()
    console.log('✅ Form data parsed successfully')
    
    // Safely get the file
    const file = formData.get('file')
    console.log('📁 File present:', !!file)
    console.log('📁 File type:', typeof file)
    console.log('📁 File constructor:', file?.constructor?.name)
    
    if (!file) {
      console.error('❌ No file found in request')
      console.log('📋 Available form fields:', Array.from(formData.keys()))
      return NextResponse.json(
        { 
          error: 'No file provided in request',
          availableFields: Array.from(formData.keys())
        },
        { status: 400 }
      )
    }

    // Validate that it's actually a File object
    if (!(file instanceof File)) {
      console.error('❌ Invalid file object:', {
        type: typeof file,
        constructor: file?.constructor?.name,
        value: file
      })
      return NextResponse.json(
        { 
          error: 'Invalid file object provided',
          receivedType: typeof file,
          constructor: file?.constructor?.name
        },
        { status: 400 }
      )
    }

    // Log file details
    console.log('📄 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type)
      return NextResponse.json(
        { 
          error: 'File must be an image',
          receivedType: file.type,
          fileName: file.name
        },
        { status: 400 }
      )
    }

    // Validate file size (10MB max for images, 5MB recommended)
    const maxSize = 10 * 1024 * 1024 // 10MB
    const recommendedSize = 5 * 1024 * 1024 // 5MB
    
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size, 'bytes (max:', maxSize, ')')
      return NextResponse.json(
        { 
          error: 'File size must be less than 10MB',
          receivedSize: file.size,
          maxSize: maxSize,
          recommendedSize: recommendedSize,
          fileName: file.name
        },
        { status: 400 }
      )
    }
    
    if (file.size > recommendedSize) {
      console.warn('⚠️ File size is large:', file.size, 'bytes (recommended max:', recommendedSize, ')')
    }

    // Check Cloudinary configuration
    console.log('☁️ Checking Cloudinary configuration...')
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    
    console.log('🔧 Cloudinary config:', {
      cloudName: cloudName ? 'Present' : 'Missing',
      apiKey: apiKey ? 'Present' : 'Missing',
      apiSecret: apiSecret ? 'Present' : 'Missing'
    })

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Missing Cloudinary configuration')
      return NextResponse.json(
        { 
          error: 'Cloudinary configuration missing',
          missingConfig: {
            cloudName: !cloudName,
            apiKey: !apiKey,
            apiSecret: !apiSecret
          }
        },
        { status: 500 }
      )
    }

    // Convert file to Buffer using arrayBuffer()
    console.log('📖 Converting file to Buffer...')
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('✅ File converted to Buffer, size:', buffer.length, 'bytes')

    // Validate buffer is not empty
    if (buffer.length === 0) {
      console.error('❌ Buffer is empty after conversion')
      return NextResponse.json(
        {
          error: 'File buffer is empty after conversion',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
        { status: 400 }
      )
    }

    // Convert image to WebP format using Sharp
    console.log('🔄 Converting image to WebP format...')
    let processedBuffer: Buffer
    let processedFileName: string
    let processedMimeType: string

    try {
      processedBuffer = await sharp(buffer)
        .webp({
          quality: 90, // High quality WebP
          effort: 6    // Better compression
        })
        .toBuffer()

      // Update filename to have .webp extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      processedFileName = `${nameWithoutExt}.webp`
      processedMimeType = 'image/webp'

      console.log('✅ Image converted to WebP successfully')
      console.log('📏 Original size:', buffer.length, 'bytes')
      console.log('📏 WebP size:', processedBuffer.length, 'bytes')
      console.log('📈 Compression ratio:', Math.round((1 - processedBuffer.length / buffer.length) * 100) + '%')
      console.log('📝 Original filename:', file.name)
      console.log('📝 New filename:', processedFileName)

    } catch (conversionError) {
      console.error('❌ WebP conversion failed:', conversionError)
      return NextResponse.json(
        {
          error: 'Failed to convert image to WebP format',
          conversionError: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        },
        { status: 400 }
      )
    }

    // Encode as base64 data URI
    console.log('📖 Converting WebP to base64 data URI...')
    const base64Data = processedBuffer.toString('base64')

    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      console.error('❌ Base64 conversion failed - empty result')
      return NextResponse.json(
        {
          error: 'Base64 conversion failed',
          fileName: processedFileName,
          fileSize: processedBuffer.length,
          fileType: processedMimeType,
          bufferSize: processedBuffer.length
        },
        { status: 400 }
      )
    }

    const dataUri = `data:${processedMimeType};base64,${base64Data}`
    console.log('✅ Base64 data URI created, length:', dataUri.length)
    console.log('📏 Base64 data length:', base64Data.length)

    // Create URLSearchParams for Cloudinary upload
    console.log('☁️ Preparing Cloudinary upload with URLSearchParams...')
    
    // Debug environment variable loading
    console.log('🔧 All environment variables starting with CLOUDINARY:')
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('CLOUDINARY')) {
        console.log(`  ${key}: ${process.env[key]}`)
      }
    })
    
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default'
    console.log('🔧 Environment variable CLOUDINARY_UPLOAD_PRESET:', process.env.CLOUDINARY_UPLOAD_PRESET)
    console.log('📋 Using upload preset:', uploadPreset)
    console.log('📋 Upload preset type:', typeof uploadPreset)
    console.log('📋 Upload preset length:', uploadPreset?.length)
    
    const params = new URLSearchParams()
    params.append('file', dataUri)
    params.append('upload_preset', uploadPreset)
    
    // Sanitize filename for Cloudinary display name compatibility
    // Remove or replace disallowed characters (slashes, backslashes, etc.)
    const sanitizedFileName = processedFileName
      .replace(/[\/\\:*?"<>|]/g, '_')  // Replace Windows/Unix invalid chars
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace any other non-alphanumeric chars
      .replace(/_+/g, '_')             // Replace multiple underscores with single
      .replace(/^_|_$/g, '')           // Remove leading/trailing underscores

    // Create a unique public_id with timestamp to avoid conflicts
    const timestamp = Date.now()
    const publicId = `upload_${timestamp}_${sanitizedFileName}`

    console.log('📝 Original filename:', file.name)
    console.log('📝 Processed filename:', processedFileName)
    console.log('🧹 Sanitized filename:', sanitizedFileName)
    console.log('🆔 Public ID:', publicId)

    params.append('public_id', publicId)

    // Use filename_override for unsigned uploads to control the display name
    params.append('filename_override', sanitizedFileName)
    
    // Log the actual parameters being sent
    console.log('📤 URLSearchParams content:')
    for (const [key, value] of params.entries()) {
      if (key === 'file') {
        console.log(`  ${key}: [data URI, length: ${value.length}]`)
      } else {
        console.log(`  ${key}: ${value}`)
      }
    }

    // Upload to Cloudinary using REST API with retry logic
    console.log('☁️ Uploading to Cloudinary with retry logic...')
    console.log('🔗 Upload URL:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    console.log('📋 Upload preset:', uploadPreset)
    console.log('📏 Data URI length:', dataUri.length)
    console.log('📏 Data URI preview:', dataUri.substring(0, 100) + '...')

    const uploadResponse = await retryRequest(async () => {
      return await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(120000) // 2 minute timeout
        }
      )
    }, 3, 2000) // 3 retries with 2 second base delay

    console.log('📡 Cloudinary response status:', uploadResponse.status)
    console.log('📡 Cloudinary response headers:', Object.fromEntries(uploadResponse.headers.entries()))

    if (!uploadResponse.ok) {
      let errorData = ''
      let errorJson = null
      
      try {
        // Try to parse as JSON first
        errorJson = await uploadResponse.json()
        errorData = JSON.stringify(errorJson, null, 2)
        console.error('❌ Cloudinary upload failed (JSON):', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorJson
        })
      } catch {
        // Fall back to text if not JSON
        errorData = await uploadResponse.text()
        console.error('❌ Cloudinary upload failed (text):', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorData
        })
      }
      
      return NextResponse.json(
        { 
          error: `Cloudinary upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
          cloudinaryError: errorJson || errorData,
          uploadDetails: {
            cloudName,
            uploadPreset,
            originalFileSize: file.size,
            originalFileType: file.type,
            processedFileSize: processedBuffer.length,
            processedFileType: processedMimeType,
            dataUriLength: dataUri.length
          },
          originalFileName: file.name,
          processedFileName: processedFileName,
          originalFileSize: file.size,
          processedFileSize: processedBuffer.length,
          originalFileType: file.type,
          processedFileType: processedMimeType,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }

    const uploadResult = await uploadResponse.json()
    console.log('✅ Cloudinary upload successful:', uploadResult.secure_url)

    const response = {
      success: true,
      imageUrl: uploadResult.secure_url,
      originalFileName: file.name,
      processedFileName: processedFileName,
      originalFileSize: file.size,
      processedFileSize: processedBuffer.length,
      originalFileType: file.type,
      processedFileType: processedMimeType,
      compressionRatio: Math.round((1 - processedBuffer.length / buffer.length) * 100),
      uploadTime: new Date().toISOString()
    }
    
    console.log('🎉 Upload completed successfully:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Upload route error:', error)

    // Provide user-friendly error messages
    let errorMessage = 'Failed to upload image'
    let userMessage = 'Upload failed due to an unexpected error'
    let errorDetails = {}

    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        stack: error.stack,
        message: error.message,
        cause: error.cause
      }

      // Provide specific user-friendly messages for common network errors
      const causeCode = (error.cause as { code?: string })?.code
      if (causeCode === 'ECONNRESET') {
        userMessage = 'Upload failed due to network connection reset. Please check your connection and try again.'
        errorMessage = 'Network connection was reset during upload'
      } else if (causeCode === 'ETIMEDOUT' || error.message.includes('timeout')) {
        userMessage = 'Upload timed out. Please try uploading a smaller image or check your internet connection.'
        errorMessage = 'Upload request timed out'
      } else if (causeCode === 'ENOTFOUND') {
        userMessage = 'Could not connect to upload service. Please check your internet connection.'
        errorMessage = 'DNS resolution failed for upload service'
      } else if (error.message.includes('fetch failed')) {
        userMessage = 'Network error occurred during upload. Please try again in a moment.'
        errorMessage = 'Network request failed'
      } else {
        errorMessage = error.message
        userMessage = 'Upload failed. Please try again or contact support if the problem persists.'
      }
    }

    console.error('📋 Error details:', errorDetails)

    return NextResponse.json(
      {
        error: errorMessage,
        userMessage: userMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        retryable: true // Indicate that the user can retry this operation
      },
      { status: 500 }
    )
  }
} 