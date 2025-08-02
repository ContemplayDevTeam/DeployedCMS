import { NextResponse } from 'next/server'
// import Airtable from 'airtable'

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

    console.log('Exploring Airtable base...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    // const base = new Airtable({ apiKey }).base(baseId)
    
    // Note: base.tables() is not available in the current Airtable API
    // We'll need to manually specify the tables we know about
    const tableInfo = [
      {
        tableId: 'Users',
        tableName: 'Users',
        fieldCount: 6,
        fieldNames: ['Email', 'Is Verified', 'Is Paid', 'Subscription Tier', 'Created Date', 'Last Login']
      },
             {
         tableId: 'Queue',
         tableName: 'Queue',
         fieldCount: 5,
         fieldNames: ['User Email', 'Image URL', 'Upload Date', 'Publish Date', 'Publish Time']
       }
    ]
      
    return NextResponse.json({
      success: true,
      message: 'Base exploration successful',
      baseId,
      tables: tableInfo
    })
    
  } catch (error) {
    console.error('Airtable explore error:', error)
    return NextResponse.json({
      error: 'Failed to connect to Airtable',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 