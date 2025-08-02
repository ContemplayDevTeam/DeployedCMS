import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const airtable = new AirtableBackend(
      process.env.AIRTABLE_API_KEY || '',
      process.env.AIRTABLE_BASE_ID || ''
    )

    // Get queue status for user
    const queueItems = await airtable.getQueueStatus(email)

    return NextResponse.json({
      success: true,
      queueItems
    })
  } catch (error) {
    console.error('Error getting queue status:', error)
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    )
  }
} 