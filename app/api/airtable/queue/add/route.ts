import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  console.log('🚀 Airtable queue add endpoint called')
  
  try {
    const { email, imageData } = await request.json()
    console.log('📋 Request data:', { email, imageData })

    if (!email || !imageData) {
      console.error('❌ Missing required data:', { email: !!email, imageData: !!imageData })
      return NextResponse.json(
        { error: 'Email and image data are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    console.log('🔧 Airtable config check:', {
      apiKey: apiKey ? 'Present' : 'Missing',
      baseId: baseId ? 'Present' : 'Missing'
    })

    if (!apiKey || !baseId) {
      console.error('❌ Missing Airtable configuration')
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Verify user exists and is verified
    console.log('👤 Looking up user:', email)
    const user = await airtable.getUser(email)
    if (!user) {
      console.error('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', { id: user.id, isVerified: user.isVerified })

    if (!user.isVerified) {
      console.error('❌ User not verified:', email)
      return NextResponse.json(
        { error: 'User not verified' },
        { status: 403 }
      )
    }

    // Queue the image
    console.log('📤 Queuing image:', {
      userEmail: email,
      imageUrl: imageData.url,
      fileName: imageData.name,
      fileSize: imageData.size,
      notes: imageData.notes
    })

    const queueItem = await airtable.queueImage(email, {
      url: imageData.url,
      name: imageData.name,
      size: imageData.size,
      notes: imageData.notes
    })

    console.log('✅ Image queued successfully:', queueItem.id)

    return NextResponse.json({
      success: true,
      queueItem
    })
  } catch (error) {
    console.error('💥 Error adding to queue:', error)
    
    // Provide detailed error information
    let errorMessage = 'Failed to add image to queue'
    let errorDetails = {}
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: error.stack,
        message: error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 