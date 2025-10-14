import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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
    const bankedItems = await airtable.getBankedImages(email)

    return NextResponse.json({
      success: true,
      bankedItems
    })
  } catch (error) {
    console.error('Error getting bank status:', error)
    return NextResponse.json(
      { error: 'Failed to get bank status' },
      { status: 500 }
    )
  }
}
