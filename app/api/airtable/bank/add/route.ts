import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  console.log('🏦 Airtable bank add endpoint called')

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

    // Verify user exists (removed verification check - if they logged in, they can upload)
    console.log('👤 Looking up user:', email)
    const user = await airtable.getUser(email)
    if (!user) {
      console.error('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', { id: user.id })

    // Bank the image
    console.log('🏦 Banking image:', {
      userEmail: email,
      imageUrl: imageData.url,
      fileName: imageData.name,
      fileSize: imageData.size,
      notes: imageData.notes
    })

    const bankedItem = await airtable.bankImage(email, {
      url: imageData.url,
      name: imageData.name,
      size: imageData.size,
      notes: imageData.notes,
      metadata: imageData.metadata,
      tags: imageData.tags,
      owner: imageData.owner
    })

    // Update user stats - increment upload count and storage
    await airtable.updateUserStats(email, 1, imageData.size || 0)

    console.log('✅ Image banked successfully:', bankedItem.id)

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
