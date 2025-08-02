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

    console.log('Testing record creation...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to create a simple test record
    try {
      const table = base('tblXfgLJOJH94UGwD')
      
      // Try to create a simple record with minimal fields
      const record = await table.create({
        'Email': 'test@example.com',
        'Is Verified': false,
        'Is Paid': false,
        'Subscription Tier': 'free',
        'Created Date': new Date().toISOString(),
        'Last Login': new Date().toISOString()
      })
      
      return NextResponse.json({
        success: true,
        message: 'Record creation successful',
        baseId,
        tableId: 'tblXfgLJOJH94UGwD',
        recordId: record.id,
        fields: record.fields
      })
      
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to create record',
        details: error instanceof Error ? error.message : 'Unknown error',
        baseId,
        tableId: 'tblXfgLJOJH94UGwD'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Create test error:', error)
    return NextResponse.json({
      error: 'Failed to connect to Airtable',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 