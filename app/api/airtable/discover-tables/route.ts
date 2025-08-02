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

    console.log('🔍 Discovering tables in Airtable base...')

    // Try different approaches to discover tables
    const results = {
      directAccess: { success: false, tables: [], error: null },
      metaApi: { success: false, tables: [], error: null },
      tableIds: { success: false, tables: [], error: null }
    }

    // Method 1: Try direct base access to see what tables are available
    try {
      const baseResponse = await fetch(`https://api.airtable.com/v0/${baseId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (baseResponse.ok) {
        const data = await baseResponse.json()
        results.directAccess.success = true
        results.directAccess.tables = data.tables || []
        console.log('✅ Direct base access successful')
      } else {
        const errorText = await baseResponse.text()
        results.directAccess.error = `${baseResponse.status} ${baseResponse.statusText} - ${errorText}`
        console.log('❌ Direct base access failed:', results.directAccess.error)
      }
    } catch (error) {
      results.directAccess.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Method 2: Try meta API
    try {
      const metaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (metaResponse.ok) {
        const data = await metaResponse.json()
        results.metaApi.success = true
        results.metaApi.tables = data.tables?.map((table: any) => ({
          name: table.name,
          id: table.id,
          fields: table.fields?.map((field: any) => ({ name: field.name, type: field.type })) || []
        })) || []
        console.log('✅ Meta API access successful')
      } else {
        const errorText = await metaResponse.text()
        results.metaApi.error = `${metaResponse.status} ${metaResponse.statusText} - ${errorText}`
        console.log('❌ Meta API access failed:', results.metaApi.error)
      }
    } catch (error) {
      results.metaApi.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Method 3: Try common table names and IDs from the codebase
    const commonTableNames = [
      'Users', 'User', 'Queue', 'Image Queue', 'Uploads', 'Images',
      'tblXfgLJOJH94UGwD', 'tblDswT92c6KgNoCg' // Table IDs from airtable.ts
    ]

    const discoveredTables = []
    for (const tableName of commonTableNames) {
      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?maxRecords=1`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          discoveredTables.push({
            name: tableName,
            accessible: true,
            fields: data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : [],
            recordCount: data.records?.length || 0
          })
          console.log(`✅ Table "${tableName}" is accessible`)
        } else {
          discoveredTables.push({
            name: tableName,
            accessible: false,
            error: `${response.status} ${response.statusText}`
          })
          console.log(`❌ Table "${tableName}" not accessible: ${response.status}`)
        }
      } catch (error) {
        discoveredTables.push({
          name: tableName,
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    results.tableIds.success = discoveredTables.length > 0
    results.tableIds.tables = discoveredTables

    // Find potential queue tables
    const potentialQueueTables = discoveredTables.filter(table => 
      table.accessible && (
        table.name.toLowerCase().includes('queue') ||
        table.name.toLowerCase().includes('image') ||
        table.name.toLowerCase().includes('upload') ||
        table.fields.some(field => 
          field.toLowerCase().includes('image') || 
          field.toLowerCase().includes('url') ||
          field.toLowerCase().includes('user email')
        )
      )
    )

    return NextResponse.json({
      success: results.directAccess.success || results.metaApi.success || results.tableIds.success,
      methods: results,
      discoveredTables: discoveredTables,
      potentialQueueTables: potentialQueueTables,
      recommendations: {
        usersTable: discoveredTables.find(t => 
          t.accessible && t.fields.includes('Email')
        )?.name || 'Users',
        queueTable: potentialQueueTables[0]?.name || 'Queue'
      }
    })

  } catch (error) {
    console.error('Table discovery error:', error)
    return NextResponse.json({
      error: 'Failed to discover tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 