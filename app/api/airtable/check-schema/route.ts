import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

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

    console.log('🔍 Checking Airtable table schema...')
    
    const airtable = new AirtableBackend(apiKey, baseId)
    
    // Check the Queue table schema
    const queueSchema = await airtable.getTableSchema('Queue')
    
    console.log('📋 Queue table schema:', queueSchema)
    
    return NextResponse.json({
      success: true,
      message: 'Schema check successful',
      queueTable: queueSchema,
      fieldTypes: queueSchema.fields.map((field: { name: string; type: string }) => ({
        name: field.name,
        type: field.type
      }))
    })
    
  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json({
      error: 'Failed to check schema',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 