import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email, imageData } = await request.json()

    if (!email || !imageData) {
      return NextResponse.json(
        { error: 'Email and image data are required' },
        { status: 400 }
      )
    }

    const airtable = new AirtableBackend(
      process.env.AIRTABLE_API_KEY || '',
      process.env.AIRTABLE_BASE_ID || ''
    )

    // Verify user exists and is verified
    const user = await airtable.getUser(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'User not verified' },
        { status: 403 }
      )
    }

    // Queue the image
    const queueItem = await airtable.queueImage(email, {
      url: imageData.url,
      name: imageData.name,
      size: imageData.size,
      notes: imageData.notes
    })

    return NextResponse.json({
      success: true,
      queueItem
    })
  } catch (error) {
    console.error('Error adding to queue:', error)
    return NextResponse.json(
      { error: 'Failed to add image to queue' },
      { status: 500 }
    )
  }
} 