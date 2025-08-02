import { NextResponse } from 'next/server'
import Airtable from 'airtable'

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

    // Create Airtable connection
    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to access tables by their IDs
    const tableIds = ['tblXfgLJOJH94UGwD', 'tblDswT92c6KgNoCg']
    const results = []
    
    for (const tableId of tableIds) {
      try {
        const records = await base(tableId).select({
          maxRecords: 1
        }).firstPage()
        
        results.push({
          tableId,
          success: true,
          recordCount: records.length
        })
      } catch (error) {
        results.push({
          tableId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Table access test results',
      results,
      apiKeyLength: apiKey.length,
      baseId: baseId
    })

  } catch (error) {
    console.error('Find tables error:', error)
    return NextResponse.json({
      error: 'Failed to test table access',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID ? 'Present' : 'Missing'
    }, { status: 500 })
  }
} 