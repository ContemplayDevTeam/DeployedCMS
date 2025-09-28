import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 DELETE API endpoint called')
    const { recordId } = await request.json()

    console.log('📥 Received recordId:', recordId)

    if (!recordId) {
      console.log('❌ No recordId provided')
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 })
    }

    console.log('🗑️ Attempting to delete record:', recordId)

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      console.error('Missing Airtable configuration')
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Delete queue item
    const success = await airtable.deleteQueueItem(recordId)

    if (success) {
      console.log('Successfully deleted record:', recordId)
      return NextResponse.json({
        success: true,
        message: 'Queue item deleted successfully'
      })
    } else {
      console.error('Airtable deleteQueueItem returned false for record:', recordId)
      return NextResponse.json(
        { error: 'Failed to delete queue item' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting queue item:', error)
    return NextResponse.json(
      { error: 'Failed to delete queue item' },
      { status: 500 }
    )
  }
} 