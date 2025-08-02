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

    console.log('🔍 Verifying Airtable field mapping...')
    
    const airtable = new AirtableBackend(apiKey, baseId)
    
    // Define expected field mappings
    const expectedUserFields = {
      'Email': 'string',
      'Is Verified': 'boolean',
      'Is Paid': 'boolean',
      'Subscription Tier': 'string',
      'Created Date': 'date',
      'Last Login': 'date'
    }

    const expectedQueueFields = {
      'User Email': 'string',
      'Image URL': 'string',
      'Upload Date': 'date',
      'Publish Date': 'date',
      'Image Queue #': 'number'
    }

    // Get actual schemas from Airtable
    let usersSchema, queueSchema
    let verificationResults = {
      users: { success: false, fields: [], missing: [], extra: [], typeMismatches: [] },
      queue: { success: false, fields: [], missing: [], extra: [], typeMismatches: [] }
    }

    try {
      // Get Users table fields by direct access instead of schema
      const usersResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Users?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (usersResponse.ok) {
        const data = await usersResponse.json()
        const userFieldNames = data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
        const expectedUserFieldNames = Object.keys(expectedUserFields)

        verificationResults.users = {
          success: true,
          fields: userFieldNames,
          missing: expectedUserFieldNames.filter(field => !userFieldNames.includes(field)),
          extra: userFieldNames.filter(field => !expectedUserFieldNames.includes(field)),
          typeMismatches: [] // Can't determine types without schema access
        }
        console.log('📋 Users table fields retrieved via direct access')
      } else {
        throw new Error(`Failed to access Users table: ${usersResponse.status}`)
      }

    } catch (error) {
      console.error('❌ Error getting Users table fields:', error)
      verificationResults.users.success = false
      verificationResults.users.error = error instanceof Error ? error.message : 'Unknown error'
    }

    try {
      // Get Queue table fields by direct access instead of schema
      const queueResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Image%20Queue?maxRecords=1`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (queueResponse.ok) {
        const data = await queueResponse.json()
        const queueFieldNames = data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
        const expectedQueueFieldNames = Object.keys(expectedQueueFields)

        verificationResults.queue = {
          success: true,
          fields: queueFieldNames,
          missing: expectedQueueFieldNames.filter(field => !queueFieldNames.includes(field)),
          extra: queueFieldNames.filter(field => !expectedQueueFieldNames.includes(field)),
          typeMismatches: [] // Can't determine types without schema access
        }
        console.log('📋 Queue table fields retrieved via direct access')
      } else {
        throw new Error(`Failed to access Queue table: ${queueResponse.status}`)
      }

    } catch (error) {
      console.error('❌ Error getting Queue table fields:', error)
      verificationResults.queue.success = false
      verificationResults.queue.error = error instanceof Error ? error.message : 'Unknown error'
    }

    // Test actual data operations
    let testResults = {
      userCreation: { success: false, error: null },
      userRetrieval: { success: false, error: null },
      queueCreation: { success: false, error: null }
    }

    // Test user creation with a test email
    const testEmail = `test-${Date.now()}@example.com`
    try {
      const testUser = await airtable.createUser({ email: testEmail })
      testResults.userCreation.success = true
      console.log('✅ Test user created successfully:', testUser.id)
      
      // Test user retrieval
      const retrievedUser = await airtable.getUserByEmail(testEmail)
      if (retrievedUser && retrievedUser.email === testEmail) {
        testResults.userRetrieval.success = true
        console.log('✅ Test user retrieval successful')
      } else {
        testResults.userRetrieval.error = 'User retrieval failed or returned incorrect data'
      }
      
    } catch (error) {
      testResults.userCreation.error = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Test user creation failed:', error)
    }

    // Test queue item creation
    try {
      const testQueueItem = await airtable.queueImage(testEmail, {
        url: 'https://example.com/test-image.jpg',
        name: 'test-image.jpg',
        size: 1024,
        notes: 'Test queue item'
      })
      testResults.queueCreation.success = true
      console.log('✅ Test queue item created successfully:', testQueueItem.id)
      
      // Clean up test data
      try {
        await airtable.deleteQueueItem(testQueueItem.id!)
        console.log('🧹 Test queue item cleaned up')
      } catch (cleanupError) {
        console.warn('⚠️ Failed to clean up test queue item:', cleanupError)
      }
      
    } catch (error) {
      testResults.queueCreation.error = error instanceof Error ? error.message : 'Unknown error'
      console.error('❌ Test queue creation failed:', error)
    }

    // Determine overall status
    const allSchemasValid = verificationResults.users.success && verificationResults.queue.success
    const allFieldsMatch = verificationResults.users.missing.length === 0 && 
                          verificationResults.queue.missing.length === 0 &&
                          verificationResults.users.typeMismatches.length === 0 &&
                          verificationResults.queue.typeMismatches.length === 0
    const allTestsPass = testResults.userCreation.success && 
                        testResults.userRetrieval.success && 
                        testResults.queueCreation.success

    const overallStatus = allSchemasValid && allFieldsMatch && allTestsPass ? 'PASS' : 'FAIL'

    return NextResponse.json({
      success: overallStatus === 'PASS',
      status: overallStatus,
      message: overallStatus === 'PASS' 
        ? 'All field mappings verified successfully' 
        : 'Field mapping issues detected',
      
      // Schema verification results
      schemaVerification: {
        users: verificationResults.users,
        queue: verificationResults.queue
      },
      
      // Test results
      testResults: testResults,
      
      // Summary
      summary: {
        schemasValid: allSchemasValid,
        fieldsMatch: allFieldsMatch,
        testsPass: allTestsPass,
        missingFields: {
          users: verificationResults.users.missing,
          queue: verificationResults.queue.missing
        },
        typeMismatches: {
          users: verificationResults.users.typeMismatches,
          queue: verificationResults.queue.typeMismatches
        }
      },
      
      // Expected field mappings for reference
      expectedMappings: {
        users: expectedUserFields,
        queue: expectedQueueFields
      }
    })
    
  } catch (error) {
    console.error('Field mapping verification error:', error)
    return NextResponse.json({
      error: 'Failed to verify field mapping',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 