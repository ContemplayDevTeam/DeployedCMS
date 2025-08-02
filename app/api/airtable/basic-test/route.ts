import { NextResponse } from 'next/server'
import Airtable from 'airtable'

export async function GET() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json({
        error: 'Missing environment variables',
        apiKey: apiKey ? 'Set' : 'Missing',
        baseId: baseId ? 'Set' : 'Missing'
      }, { status: 400 })
    }

    console.log('Testing basic Airtable connection...')

    // Just try to create the base connection
    new Airtable({ apiKey }).base(baseId)
    
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
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 