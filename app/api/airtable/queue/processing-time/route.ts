import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { recordId, processingTimeSeconds } = await request.json()

    if (!recordId || typeof processingTimeSeconds !== 'number') {
      return NextResponse.json({ error: 'Record ID and processing time (seconds) are required' }, { status: 400 })
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

    // Update processing time for queue item
    const success = await airtable.updateQueueItemProcessingTime(recordId, processingTimeSeconds)

    if (!success) {
      return NextResponse.json({ error: 'Failed to update processing time' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Processing time updated successfully'
    })
  } catch (error) {
    console.error('Error updating processing time:', error)
    return NextResponse.json(
      { error: 'Failed to update processing time' },
      { status: 500 }
    )
  }
}