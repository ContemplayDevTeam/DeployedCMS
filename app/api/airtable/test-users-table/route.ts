import { NextResponse } from 'next/server'

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

    console.log('Testing Users table access...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    // Try to access the Users table without any filters
    const url = `https://api.airtable.com/v0/${baseId}/Users?maxRecords=1`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: 'Users table access failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        baseId,
        tableName: 'Users'
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Users table access successful',
      baseId,
      tableName: 'Users',
      recordCount: data.records?.length || 0,
      firstRecord: data.records?.[0] || null,
      fields: data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
    })
    
  } catch (error) {
    console.error('Users table test error:', error)
    return NextResponse.json({
      error: 'Failed to access Users table',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 