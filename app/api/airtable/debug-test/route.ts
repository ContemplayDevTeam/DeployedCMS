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

    console.log('Testing Airtable connection...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    const base = new Airtable({ apiKey }).base(baseId)
    
    // Try to get all tables in the base
    try {
      // This is a workaround to get table names - we'll try common table names
      const commonTableNames = ['Users', 'Image Queue', 'Queue', 'Images', 'User', 'Queue Items']
      const results = []
      
      for (const tableName of commonTableNames) {
        try {
          const records = await base(tableName).select({ maxRecords: 1 }).firstPage()
          results.push({
            tableName,
            success: true,
            recordCount: records.length
          })
        } catch (error) {
          results.push({
            tableName,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Table access test results',
        results,
        baseId,
        apiKeyLength: apiKey.length
      })
      
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to access base',
        details: error instanceof Error ? error.message : 'Unknown error',
        baseId
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Airtable debug test error:', error)
    return NextResponse.json({
      error: 'Failed to connect to Airtable',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 