import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST() {
  console.log('🧪 Testing queue record creation...')
  
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Test with minimal data to see what fields are required
    const testData = {
      userEmail: 'test@example.com',
      imageData: {
        url: 'https://example.com/test.jpg',
        name: 'test.jpg',
        size: 1024,
        notes: 'Test upload'
      }
    }

    console.log('📤 Testing queue creation with:', testData)

    const queueItem = await airtable.queueImage(testData.userEmail, testData.imageData)

    return NextResponse.json({
      success: true,
      queueItem
    })

  } catch (error) {
    console.error('💥 Test failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 