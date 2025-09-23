#!/usr/bin/env node

/**
 * Debug script to test Airtable permissions
 * Run with: node debug-permissions.js
 */

const BASE_URL = 'http://localhost:3000'

async function debugPermissions() {
  console.log('🔍 Debugging Airtable permissions...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/debug-permissions`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      console.error('Error details:', data)
      return
    }
    
    // Display results
    console.log('📊 PERMISSIONS DEBUG RESULTS\n')
    console.log(`Overall Success: ${data.success ? '✅' : '❌'}\n`)
    
    // Environment info
    console.log('🔧 ENVIRONMENT')
    console.log('='.repeat(50))
    console.log(`Base ID: ${data.environment.baseId}`)
    console.log(`API Key: ${data.environment.apiKeyPresent ? data.environment.apiKeyPrefix : 'Missing'}\n`)
    
    // Test results
    console.log('🧪 PERMISSION TESTS')
    console.log('='.repeat(50))
    
    // Base access
    const baseTest = data.tests.baseAccess
    console.log(`Base Access: ${baseTest.success ? '✅ PASS' : '❌ FAIL'}`)
    if (!baseTest.success && baseTest.error) {
      console.log(`   Error: ${baseTest.error}`)
    }
    
    // Users table
    const usersTest = data.tests.usersTable
    console.log(`Users Table: ${usersTest.success ? '✅ PASS' : '❌ FAIL'}`)
    if (usersTest.success && usersTest.fields.length > 0) {
      console.log(`   Fields: ${usersTest.fields.join(', ')}`)
    }
    if (!usersTest.success && usersTest.error) {
      console.log(`   Error: ${usersTest.error}`)
    }
    
    // Queue table
    const queueTest = data.tests.queueTable
    console.log(`Queue Table: ${queueTest.success ? '✅ PASS' : '❌ FAIL'}`)
    if (queueTest.success && queueTest.fields.length > 0) {
      console.log(`   Fields: ${queueTest.fields.join(', ')}`)
    }
    if (!queueTest.success && queueTest.error) {
      console.log(`   Error: ${queueTest.error}`)
    }
    
    // Meta API
    const metaTest = data.tests.metaApi
    console.log(`Meta API: ${metaTest.success ? '✅ PASS' : '❌ FAIL'}`)
    if (metaTest.success && metaTest.tables.length > 0) {
      console.log(`   Tables: ${metaTest.tables.map(t => t.name).join(', ')}`)
    }
    if (!metaTest.success && metaTest.error) {
      console.log(`   Error: ${metaTest.error}`)
    }
    
    // Summary and recommendations
    console.log('\n📈 SUMMARY & RECOMMENDATIONS')
    console.log('='.repeat(50))
    
    if (data.success) {
      console.log('✅ At least some Airtable access is working')
      
      if (usersTest.success && queueTest.success) {
        console.log('✅ Both Users and Queue tables are accessible')
        console.log('✅ Field mapping verification should work')
      } else if (usersTest.success || queueTest.success) {
        console.log('⚠️  Only one table is accessible - check table names')
      }
      
      if (metaTest.success) {
        console.log('✅ Schema access is working - can get field information')
      } else {
        console.log('⚠️  Schema access not working - using direct table access')
      }
      
    } else {
      console.log('❌ No Airtable access is working')
      console.log('\n🔧 TROUBLESHOOTING STEPS:')
      console.log('1. Check your AIRTABLE_API_KEY environment variable')
      console.log('2. Verify your AIRTABLE_BASE_ID is correct')
      console.log('3. Ensure your API key has access to the base')
      console.log('4. Check if the base is shared with your account')
      console.log('5. Verify table names match exactly (case-sensitive)')
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.error('Make sure your Next.js development server is running on http://localhost:3000')
  }
}

// Run the debug
debugPermissions() 