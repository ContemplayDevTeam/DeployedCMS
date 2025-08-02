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

    console.log('Testing Airtable connection...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)
    
    // Simple test - try to access the Users table
    const usersTable = base('Users')
    const records = await usersTable.select({ maxRecords: 1 }).firstPage()
    
    return NextResponse.json({
      success: true,
      message: 'Airtable connection successful!',
      baseId,
      recordsFound: records.length,
      tables: ['Users', 'Image Queue']
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