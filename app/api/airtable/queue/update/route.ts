import { NextRequest, NextResponse } from 'next/server'
import { airtable } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { recordId, publishDate, publishTime } = await request.json()

    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    // Update the queue item in Airtable
    await airtable.updateQueueItem(recordId, {
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
