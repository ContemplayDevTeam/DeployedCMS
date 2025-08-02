import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { userEmail, newOrder } = await request.json()

    if (!userEmail || !newOrder || !Array.isArray(newOrder)) {
      return NextResponse.json({ error: 'User email and new order array are required' }, { status: 400 })
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

    // Reorder queue items
    const success = await airtable.reorderQueue(userEmail, newOrder)

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Queue reordered successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to reorder queue' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error reordering queue:', error)
    return NextResponse.json(
      { error: 'Failed to reorder queue' },
      { status: 500 }
    )
  }
} 