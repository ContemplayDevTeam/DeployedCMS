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

    console.log('Exploring Airtable base...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to list all tables in the base
    try {
      // This will try to access the base metadata
      const tables = await base.tables()
      
      const tableInfo = []
      for (const table of tables) {
        try {
          const fields = table.fields
          const fieldNames = fields.map(field => field.name)
          
          tableInfo.push({
            tableId: table.id,
            tableName: table.name,
            fieldCount: fields.length,
            fieldNames: fieldNames
          })
        } catch (error) {
          tableInfo.push({
            tableId: table.id,
            tableName: table.name,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Base exploration successful',
        baseId,
        tables: tableInfo
      })
      
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to explore base',
        details: error instanceof Error ? error.message : 'Unknown error',
        baseId
      }, { status: 500 })
    }
    
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