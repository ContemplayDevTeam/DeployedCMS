import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function GET() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    
    if (!apiKey || !baseId) {
      return NextResponse.json({
        error: 'Missing environment variables',
        apiKey: apiKey ? 'Present' : 'Missing',
        baseId: baseId ? 'Present' : 'Missing'
      }, { status: 500 })
    }

    const airtable = new AirtableBackend(apiKey, baseId)
    
    // Try to access the Users table by creating a test user lookup
    const testUser = await airtable.getUserByEmail('test@example.com')

    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful',
      testUserFound: testUser !== null,
      apiKeyLength: apiKey.length,
      baseId: baseId
    })

  } catch (error) {
    console.error('Airtable connection test error:', error)
    return NextResponse.json({
      error: 'Airtable connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID ? 'Present' : 'Missing'
    }, { status: 500 })
  }
} 