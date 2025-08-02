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
      }, { status: 400 })
    }

    console.log('Testing table access...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to access the table directly by ID
    try {
      const table = base('tblXfgLJOJH94UGwD')
      
      // Try to get the first record to see if we can access it
      const records = await table.select({
        maxRecords: 1
      }).firstPage()
      
      return NextResponse.json({
        success: true,
        message: 'Table access successful',
        baseId,
        tableId: 'tblXfgLJOJH94UGwD',
        recordsFound: records.length,
        firstRecord: records.length > 0 ? records[0].fields : null
      })
      
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to access table',
        details: error instanceof Error ? error.message : 'Unknown error',
        baseId,
        tableId: 'tblXfgLJOJH94UGwD'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Table access test error:', error)
    return NextResponse.json({
      error: 'Failed to connect to Airtable',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 