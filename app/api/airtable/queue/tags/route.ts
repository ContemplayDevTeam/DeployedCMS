import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

// Add tags to a queue item
export async function POST(request: NextRequest) {
  try {
    const { recordId, tags } = await request.json()

    if (!recordId || !tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Record ID and tags array are required' }, { status: 400 })
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

    // Add tags to queue item
    const success = await airtable.addTagsToQueueItem(recordId, tags)

    if (!success) {
      return NextResponse.json({ error: 'Failed to add tags' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Tags added successfully'
    })
  } catch (error) {
    console.error('Error adding tags to queue item:', error)
    return NextResponse.json(
      { error: 'Failed to add tags' },
      { status: 500 }
    )
  }
}

// Get queue items by tag
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const tag = searchParams.get('tag')

    if (!email || !tag) {
      return NextResponse.json({ error: 'Email and tag are required' }, { status: 400 })
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

    // Get queue items by tag
    const queueItems = await airtable.getQueueItemsByTag(email, tag)

    return NextResponse.json({
      success: true,
      queueItems
    })
  } catch (error) {
    console.error('Error getting queue items by tag:', error)
    return NextResponse.json(
      { error: 'Failed to get queue items by tag' },
      { status: 500 }
    )
  }
}