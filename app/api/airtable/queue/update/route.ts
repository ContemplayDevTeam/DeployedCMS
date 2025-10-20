import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { recordId, fileName, publishDate, publishTime } = await request.json()

    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    // Check environment variables
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Update the queue item in Airtable
    await airtable.updateQueueItem(recordId, {
      fileName,
      publishDate,
      publishTime
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error updating queue item:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update queue item' },
      { status: 500 }
    )
  }
}
