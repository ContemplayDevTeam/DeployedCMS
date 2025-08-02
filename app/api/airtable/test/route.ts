import { NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function GET() {
  console.log('🧪 Airtable test endpoint called')
  
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    console.log('🔧 Airtable config check:', {
      apiKey: apiKey ? 'Present' : 'Missing',
      baseId: baseId ? 'Present' : 'Missing'
    })

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { 
          error: 'Missing Airtable configuration',
          missingConfig: {
            apiKey: !apiKey,
            baseId: !baseId
          }
        },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Test 1: Check if we can access the base
    console.log('🔍 Testing base access...')
    let baseInfo = null
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        baseInfo = await response.json()
        console.log('✅ Base access successful')
      } else {
        console.error('❌ Base access failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('❌ Base access error:', error)
    }

    // Test 2: Check Users table
    console.log('👥 Testing Users table...')
    let usersTest = null
    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Users?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        usersTest = await response.json()
        console.log('✅ Users table accessible')
      } else {
        const errorText = await response.text()
        console.error('❌ Users table error:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Users table error:', error)
    }

    // Test 3: Check Image Queue table
    console.log('📋 Testing Image Queue table...')
    let queueTest = null
    let queueSchema = null
    try {
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Image Queue?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        queueTest = await response.json()
        console.log('✅ Image Queue table accessible')
        
        // Get table schema
        try {
          queueSchema = await airtable.getTableSchema('Image Queue')
        } catch (schemaError) {
          console.error('❌ Could not get table schema:', schemaError)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Image Queue table error:', response.status, errorText)
      }
    } catch (error) {
      console.error('❌ Image Queue table error:', error)
    }

    return NextResponse.json({
      success: true,
      config: {
        apiKey: apiKey ? 'Present' : 'Missing',
        baseId: baseId ? 'Present' : 'Missing'
      },
      baseInfo: baseInfo ? {
        accessible: true,
        tableCount: baseInfo.tables?.length || 0,
        tableNames: baseInfo.tables?.map((t: { name: string }) => t.name) || []
      } : {
        accessible: false
      },
      usersTable: usersTest ? {
        accessible: true,
        recordCount: usersTest.records?.length || 0
      } : {
        accessible: false
      },
      imageQueueTable: queueTest ? {
        accessible: true,
        recordCount: queueTest.records?.length || 0,
        schema: queueSchema ? {
          fieldCount: queueSchema.fields?.length || 0,
          fieldNames: queueSchema.fields?.map((f: { name: string }) => f.name) || []
        } : null
      } : {
        accessible: false
      }
    })

  } catch (error) {
    console.error('💥 Airtable test error:', error)
    return NextResponse.json(
      { 
        error: 'Airtable test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 