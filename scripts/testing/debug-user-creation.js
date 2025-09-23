#!/usr/bin/env node

/**
 * Debug user creation issues
 * Run with: node debug-user-creation.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugUserCreation() {
  console.log('🔍 Debugging user creation issues...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/debug-user-creation`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      console.error('Error details:', data)
      return
    }
    
    // Display results
    console.log('📊 USER CREATION DEBUG RESULTS\n')
    console.log(`Overall Success: ${data.success ? '✅' : '❌'}`)
    console.log(`Test Email: ${data.testEmail}\n`)
    
    // Environment info
    console.log('🔧 ENVIRONMENT')
    console.log('='.repeat(50))
    console.log(`Base ID: ${data.environment.baseId}`)
    console.log(`API Key: ${data.environment.apiKeyPresent ? data.environment.apiKeyPrefix : 'Missing'}\n`)
    
    // Test results
    console.log('🧪 TEST RESULTS')
    console.log('='.repeat(50))
    
    // Create tests
    console.log('📝 User Creation Tests:')
    data.tests.createTests.forEach((test, index) => {
      console.log(`   ${index + 1}. ${test.format}: ${test.success ? '✅ PASS' : '❌ FAIL'}`)
      if (!test.success && test.error) {
        console.log(`      Error: ${test.error}`)
      }
      if (test.response) {
        console.log(`      Response: ${JSON.stringify(test.response, null, 2)}`)
      }
    })
    
    // Existing users test
    const existingTest = data.tests.existingUsers
    console.log(`Existing Users Check: ${existingTest.success ? '✅ PASS' : '❌ FAIL'}`)
    if (!existingTest.success && existingTest.error) {
      console.log(`   Error: ${existingTest.error}`)
    }
    if (existingTest.response && existingTest.response.records && existingTest.response.records.length > 0) {
      console.log(`   Found ${existingTest.response.records.length} existing user(s)`)
      console.log(`   Sample user fields: ${Object.keys(existingTest.response.records[0].fields).join(', ')}`)
    }
    
    // Analysis
    console.log('\n📈 ANALYSIS')
    console.log('='.repeat(50))
    
    if (data.success) {
      console.log('🎉 All user operations are working correctly!')
    } else {
      console.log('❌ User operations have issues')
      
      if (!createTest.success) {
        console.log('\n🔧 USER CREATION ISSUES:')
        if (createTest.error.includes('422')) {
          console.log('   - 422 Error: Invalid field data or missing required fields')
          console.log('   - Check field names and data types')
        } else if (createTest.error.includes('403')) {
          console.log('   - 403 Error: Permission denied')
          console.log('   - Check API key permissions for the Users table')
        } else if (createTest.error.includes('404')) {
          console.log('   - 404 Error: Table not found')
          console.log('   - Check if "Users" table exists in your base')
        }
      }
      
      if (!existingTest.success) {
        console.log('\n🔧 TABLE ACCESS ISSUES:')
        console.log('   - Cannot access Users table')
        console.log('   - Check table name and permissions')
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.error('Make sure your Next.js development server is running on http://localhost:3000')
  }
}

// Run the debug
debugUserCreation() 