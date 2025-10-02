import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  console.log('📤 Move banked image to queue endpoint called')

  try {
    const { email, recordId, publishDate } = await request.json()

    if (!email || !recordId) {
      return NextResponse.json(
        { error: 'Email and record ID are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Verify user
    const user = await airtable.getUser(email)
    if (!user || !user.isVerified) {
      return NextResponse.json(
        { error: 'User not found or not verified' },
        { status: 403 }
      )
    }

    // Move to queue
    const success = await airtable.moveBankedToQueue(recordId, publishDate)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to move image to queue' },
        { status: 500 }
      )
    }

    console.log('✅ Successfully moved banked image to queue')

    return NextResponse.json({
      success: true,
      message: 'Image moved to queue successfully'
    })
  } catch (error) {
    console.error('💥 Error moving banked image to queue:', error)
    return NextResponse.json(
      { error: 'Failed to move image to queue' },
      { status: 500 }
    )
  }
}
