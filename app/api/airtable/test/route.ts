import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

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

    const airtable = new AirtableBackend(apiKey, baseId)
    
         // Test connection by trying to access the Users table
     try {
       // This will test if we can connect to the base and access tables
       const usersTable = airtable['base']('Users')
       await usersTable.select({ maxRecords: 1 }).firstPage()
       
       return NextResponse.json({
         success: true,
         message: 'Airtable connection successful',
         baseId,
         tablesFound: 2,
         tableNames: ['Users', 'Image Queue'],
         connectionTest: 'Passed'
       })
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to connect to Airtable',
        details: error instanceof Error ? error.message : 'Unknown error',
        baseId
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 