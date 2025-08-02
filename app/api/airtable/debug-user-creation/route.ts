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

    console.log('🔍 Debugging user creation...')
    const testEmail = `test-${Date.now()}@example.com`
    
    // Test 1: Check existing users to see date format
    let existingUsersTest: { success: boolean; error: string | null; response: any } = { success: false, error: null, response: null }
    try {
      console.log('📋 Checking existing users...')
      
      const existingResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Users?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const existingData = await existingResponse.text()
      console.log('📡 Existing users response status:', existingResponse.status)
      console.log('📡 Existing users response body:', existingData)

      if (existingResponse.ok) {
        existingUsersTest.success = true
        existingUsersTest.response = JSON.parse(existingData)
        console.log('✅ Existing users check successful')
      } else {
        existingUsersTest.error = `${existingResponse.status} ${existingResponse.statusText} - ${existingData}`
        console.log('❌ Existing users check failed:', existingUsersTest.error)
      }
    } catch (error) {
      existingUsersTest.error = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Existing users check error:', existingUsersTest.error)
    }

    // Test 2: Try to create user with different date formats
    let createTests = []
    
    // Format 1: YYYY-MM-DD (date only)
    try {
      console.log('📝 Attempting to create user with YYYY-MM-DD format...')
      
      const createResponse1 = await fetch(`https://api.airtable.com/v0/${baseId}/Users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': testEmail + '-1',
              'Is Verified': false,
              'Is Paid': false,
              'Subscription Tier': 'free',
              'Created Date': new Date().toISOString().split('T')[0], // YYYY-MM-DD
              'Last Login': new Date().toISOString().split('T')[0] // YYYY-MM-DD
            }
          }]
        })
      })

      const createData1 = await createResponse1.text()
      console.log('📡 Create response 1 status:', createResponse1.status)
      console.log('📡 Create response 1 body:', createData1)

      createTests.push({
        format: 'YYYY-MM-DD',
        success: createResponse1.ok,
        error: createResponse1.ok ? null : `${createResponse1.status} ${createResponse1.statusText} - ${createData1}`,
        response: createResponse1.ok ? JSON.parse(createData1) : null
      })
    } catch (error) {
      createTests.push({
        format: 'YYYY-MM-DD',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: null
      })
    }

    // Format 2: No dates (let Airtable handle it)
    try {
      console.log('📝 Attempting to create user without dates...')
      
      const createResponse2 = await fetch(`https://api.airtable.com/v0/${baseId}/Users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            fields: {
              'Email': testEmail + '-2',
              'Is Verified': false,
              'Is Paid': false,
              'Subscription Tier': 'free'
              // No dates - let Airtable handle them
            }
          }]
        })
      })

      const createData2 = await createResponse2.text()
      console.log('📡 Create response 2 status:', createResponse2.status)
      console.log('📡 Create response 2 body:', createData2)

      createTests.push({
        format: 'No dates',
        success: createResponse2.ok,
        error: createResponse2.ok ? null : `${createResponse2.status} ${createResponse2.statusText} - ${createData2}`,
        response: createResponse2.ok ? JSON.parse(createData2) : null
      })
    } catch (error) {
      createTests.push({
        format: 'No dates',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        response: null
      })
    }

    return NextResponse.json({
      success: createTests.some(test => test.success),
      tests: {
        existingUsers: existingUsersTest,
        createTests: createTests
      },
      testEmail: testEmail,
      environment: {
        baseId: baseId,
        apiKeyPresent: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Debug user creation error:', error)
    return NextResponse.json({
      error: 'Failed to debug user creation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 