import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('🏦 Bank add endpoint called (local storage)')

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

    // Create banked item (stored client-side in local storage)
    const bankedItem = {
      id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userEmail: email,
      imageUrl: imageData.url,
      fileName: imageData.name,
      fileSize: imageData.size,
      uploadDate: new Date().toISOString(),
      notes: imageData.notes || '',
      metadata: imageData.metadata || {},
      tags: imageData.tags || [],
      owner: imageData.owner || '',
      approved: false
    }

    console.log('✅ Image banked successfully (client-side):', bankedItem.id)

    return NextResponse.json({
      success: true,
      bankedItem
    })
  } catch (error) {
    console.error('💥 Error adding to bank:', error)

    let errorMessage = 'Failed to add image to bank'
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
