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

    console.log('Testing base access...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    // Try to access the base metadata
    const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
    
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
        error: 'Base access failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        baseId
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Base access successful',
      baseId,
      tables: data.tables || []
    })
    
  } catch (error) {
    console.error('Base access test error:', error)
    return NextResponse.json({
      error: 'Failed to access base',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 