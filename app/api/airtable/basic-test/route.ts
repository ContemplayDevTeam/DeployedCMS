import { NextRequest, NextResponse } from 'next/server'
import Airtable from 'airtable'

export async function GET() {
  try {
    const apiKey = 'pat7OlfrIjGxb9zT4.70dffbf37f8a9ff8e823b9d38fb01890e335cc5ee3eb2ce4e5e59a7e067619e0'
    const baseId = '4ZTtBg4oTHLUz'

    console.log('Testing basic Airtable connection...')

    // Just try to create the base connection
    const base = new Airtable({ apiKey }).base(baseId)
    
    return NextResponse.json({
      success: true,
      message: 'Airtable base connection created successfully!',
      baseId,
      apiKeyLength: apiKey.length,
      connectionTest: 'Passed'
    })
    
  } catch (error) {
    console.error('Airtable test error:', error)
    return NextResponse.json({
      error: 'Failed to connect to Airtable',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKeyLength: 'pat7OlfrIjGxb9zT4.70dffbf37f8a9ff8e823b9d38fb01890e335cc5ee3eb2ce4e5e59a7e067619e0'.length,
      baseId: '4ZTtBg4oTHLUz'
    }, { status: 500 })
  }
} 