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

    console.log('Testing user creation...')
    console.log('API Key:', apiKey ? 'Present' : 'Missing')
    console.log('Base ID:', baseId)

    // Try to create a simple user record
    const url = `https://api.airtable.com/v0/${baseId}/tblXfgLJOJH94UGwD`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Email': 'test@example.com',
            'Is Verified': false,
            'Is Paid': false,
            'Subscription Tier': 'free',
            'Created Date': new Date().toISOString(),
            'Last Login': new Date().toISOString()
          }
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        error: 'User creation failed',
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        baseId,
        tableId: 'tblXfgLJOJH94UGwD'
      }, { status: response.status })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'User creation successful',
      baseId,
      tableId: 'tblXfgLJOJH94UGwD',
      recordId: data.records?.[0]?.id,
      fields: data.records?.[0]?.fields
    })
    
  } catch (error) {
    console.error('User creation test error:', error)
    return NextResponse.json({
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error',
      apiKey: process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing',
      baseId: process.env.AIRTABLE_BASE_ID
    }, { status: 500 })
  }
} 