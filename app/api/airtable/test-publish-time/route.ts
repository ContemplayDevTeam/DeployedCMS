import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST() {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json({
        error: 'Missing environment variables'
      }, { status: 400 })
    }

    const airtable = new AirtableBackend(apiKey, baseId)
    const testEmail = 'test@example.com'
    const testImageUrl = 'https://example.com/test.jpg'
    
    // Test different formats for Publish Time
    const testFormats = [
      { name: 'ISO 8601 with Z', value: '2025-08-02T08:00:00.000Z' },
      { name: 'ISO 8601 without Z', value: '2025-08-02T08:00:00.000' },
      { name: 'Date only', value: '2025-08-02' },
      { name: 'Time only', value: '08:00' },
      { name: 'Time with seconds', value: '08:00:00' },
      { name: 'Empty string', value: '' },
      { name: 'Null', value: null }
    ]

    const results = []

    for (const format of testFormats) {
      try {
        console.log(`🧪 Testing format: ${format.name} = ${format.value}`)
        
        const testData = {
          url: testImageUrl,
          name: `test-${format.name}`,
          size: 1000,
          publishDate: '2025-08-02'
        }

        // Create a custom payload with the test format
        const fields: Record<string, unknown> = {
          'User Email': testEmail,
          'Image URL': testImageUrl,
          'Upload Date': new Date().toISOString().split('T')[0],
          'Publish Date': '2025-08-02'
        }

        // Only add Publish Time if it's not null
        if (format.value !== null) {
          fields['Publish Time'] = format.value
        }

        const payload = {
          records: [{
            fields
          }]
        }

        // Make direct request to test
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/tblDswT92c6KgNoCg`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        const responseText = await response.text()
        const success = response.ok

        results.push({
          format: format.name,
          value: format.value,
          success,
          status: response.status,
          response: responseText
        })

        console.log(`✅ ${format.name}: ${success ? 'SUCCESS' : 'FAILED'} (${response.status})`)

      } catch (error) {
        results.push({
          format: format.name,
          value: format.value,
          success: false,
          status: 'ERROR',
          response: error instanceof Error ? error.message : 'Unknown error'
        })
        console.log(`❌ ${format.name}: ERROR`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Publish Time format tests completed',
      results
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      error: 'Failed to test formats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 