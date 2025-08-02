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

    console.log('🔍 Testing Airtable permissions...')
    console.log('Base ID:', baseId)
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'Missing')

    // Test 1: Basic base access
    let baseAccessTest = { success: false, error: null }
    try {
      const baseResponse = await fetch(`https://api.airtable.com/v0/${baseId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (baseResponse.ok) {
        baseAccessTest.success = true
        console.log('✅ Base access successful')
      } else {
        const errorText = await baseResponse.text()
        baseAccessTest.error = `${baseResponse.status} ${baseResponse.statusText} - ${errorText}`
        console.log('❌ Base access failed:', baseAccessTest.error)
      }
    } catch (error) {
      baseAccessTest.error = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Base access error:', baseAccessTest.error)
    }

    // Test 2: Try to access Users table directly
    let usersTableTest = { success: false, error: null, fields: [] }
    try {
      const usersResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Users?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (usersResponse.ok) {
        const data = await usersResponse.json()
        usersTableTest.success = true
        usersTableTest.fields = data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
        console.log('✅ Users table access successful')
        console.log('📝 Fields found:', usersTableTest.fields)
      } else {
        const errorText = await usersResponse.text()
        usersTableTest.error = `${usersResponse.status} ${usersResponse.statusText} - ${errorText}`
        console.log('❌ Users table access failed:', usersTableTest.error)
      }
    } catch (error) {
      usersTableTest.error = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Users table access error:', usersTableTest.error)
    }

    // Test 3: Try to access Queue table directly
    let queueTableTest = { success: false, error: null, fields: [] }
    try {
      const queueResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Image%20Queue?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (queueResponse.ok) {
        const data = await queueResponse.json()
        queueTableTest.success = true
        queueTableTest.fields = data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
        console.log('✅ Queue table access successful')
        console.log('📝 Fields found:', queueTableTest.fields)
      } else {
        const errorText = await queueResponse.text()
        queueTableTest.error = `${queueResponse.status} ${queueResponse.statusText} - ${errorText}`
        console.log('❌ Queue table access failed:', queueTableTest.error)
      }
    } catch (error) {
      queueTableTest.error = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Queue table access error:', queueTableTest.error)
    }

    // Test 4: Try to access meta API for schema
    let metaApiTest = { success: false, error: null, tables: [] }
    try {
      const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (metaResponse.ok) {
        const data = await metaResponse.json()
        metaApiTest.success = true
        metaApiTest.tables = data.tables?.map((table: any) => ({
          name: table.name,
          id: table.id,
          fields: table.fields?.map((field: any) => ({ name: field.name, type: field.type })) || []
        })) || []
        console.log('✅ Meta API access successful')
        console.log('📋 Tables found:', metaApiTest.tables.map(t => t.name))
      } else {
        const errorText = await metaResponse.text()
        metaApiTest.error = `${metaResponse.status} ${metaResponse.statusText} - ${errorText}`
        console.log('❌ Meta API access failed:', metaApiTest.error)
      }
    } catch (error) {
      metaApiTest.error = error instanceof Error ? error.message : 'Unknown error'
      console.log('❌ Meta API access error:', metaApiTest.error)
    }

    return NextResponse.json({
      success: baseAccessTest.success || usersTableTest.success || queueTableTest.success,
      tests: {
        baseAccess: baseAccessTest,
        usersTable: usersTableTest,
        queueTable: queueTableTest,
        metaApi: metaApiTest
      },
      environment: {
        baseId: baseId,
        apiKeyPresent: !!apiKey,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : 'Missing'
      }
    })

  } catch (error) {
    console.error('Permission debug error:', error)
    return NextResponse.json({
      error: 'Failed to debug permissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 