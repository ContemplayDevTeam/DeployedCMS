#!/usr/bin/env node

/**
 * Test script to verify Airtable field mapping
 * Run with: node test-field-mapping.js
 */

const BASE_URL = 'http://localhost:3000'

async function testFieldMapping() {
  console.log('🔍 Testing Airtable field mapping...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/verify-field-mapping`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      console.error('Error details:', data)
      return
    }
    
    // Display results
    console.log('📊 FIELD MAPPING VERIFICATION RESULTS\n')
    console.log(`Overall Status: ${data.status}`)
    console.log(`Message: ${data.message}\n`)
    
    // Schema verification results
    console.log('📋 SCHEMA VERIFICATION')
    console.log('='.repeat(50))
    
    // Users table
    console.log('\n👥 USERS TABLE:')
    const users = data.schemaVerification.users
    if (users.success) {
      console.log(`✅ Schema accessible`)
      console.log(`📝 Fields found: ${users.fields.length}`)
      console.log(`   ${users.fields.join(', ')}`)
      
      if (users.missing.length > 0) {
        console.log(`❌ Missing fields: ${users.missing.join(', ')}`)
      }
      
      if (users.extra.length > 0) {
        console.log(`⚠️  Extra fields: ${users.extra.join(', ')}`)
      }
      
      if (users.typeMismatches.length > 0) {
        console.log(`🔄 Type mismatches:`)
        users.typeMismatches.forEach(mismatch => {
          console.log(`   ${mismatch.field}: expected ${mismatch.expected}, got ${mismatch.actual}`)
        })
      }
    } else {
      console.log(`❌ Schema access failed: ${users.error}`)
    }
    
    // Queue table
    console.log('\n📤 QUEUE TABLE:')
    const queue = data.schemaVerification.queue
    if (queue.success) {
      console.log(`✅ Schema accessible`)
      console.log(`📝 Fields found: ${queue.fields.length}`)
      console.log(`   ${queue.fields.join(', ')}`)
      
      if (queue.missing.length > 0) {
        console.log(`❌ Missing fields: ${queue.missing.join(', ')}`)
      }
      
      if (queue.extra.length > 0) {
        console.log(`⚠️  Extra fields: ${queue.extra.join(', ')}`)
      }
      
      if (queue.typeMismatches.length > 0) {
        console.log(`🔄 Type mismatches:`)
        queue.typeMismatches.forEach(mismatch => {
          console.log(`   ${mismatch.field}: expected ${mismatch.expected}, got ${mismatch.actual}`)
        })
      }
    } else {
      console.log(`❌ Schema access failed: ${queue.error}`)
    }
    
    // Test results
    console.log('\n🧪 FUNCTIONAL TESTS')
    console.log('='.repeat(50))
    
    const tests = data.testResults
    console.log(`User Creation: ${tests.userCreation.success ? '✅ PASS' : '❌ FAIL'}`)
    if (!tests.userCreation.success) {
      console.log(`   Error: ${tests.userCreation.error}`)
    }
    
    console.log(`User Retrieval: ${tests.userRetrieval.success ? '✅ PASS' : '❌ FAIL'}`)
    if (!tests.userRetrieval.success) {
      console.log(`   Error: ${tests.userRetrieval.error}`)
    }
    
    console.log(`Queue Creation: ${tests.queueCreation.success ? '✅ PASS' : '❌ FAIL'}`)
    if (!tests.queueCreation.success) {
      console.log(`   Error: ${tests.queueCreation.error}`)
    }
    
    // Summary
    console.log('\n📈 SUMMARY')
    console.log('='.repeat(50))
    const summary = data.summary
    console.log(`Schemas Valid: ${summary.schemasValid ? '✅' : '❌'}`)
    console.log(`Fields Match: ${summary.fieldsMatch ? '✅' : '❌'}`)
    console.log(`Tests Pass: ${summary.testsPass ? '✅' : '❌'}`)
    
    if (summary.missingFields.users.length > 0 || summary.missingFields.queue.length > 0) {
      console.log('\n❌ MISSING FIELDS:')
      if (summary.missingFields.users.length > 0) {
        console.log(`   Users: ${summary.missingFields.users.join(', ')}`)
      }
      if (summary.missingFields.queue.length > 0) {
        console.log(`   Queue: ${summary.missingFields.queue.join(', ')}`)
      }
    }
    
    if (summary.typeMismatches.users.length > 0 || summary.typeMismatches.queue.length > 0) {
      console.log('\n🔄 TYPE MISMATCHES:')
      if (summary.typeMismatches.users.length > 0) {
        console.log(`   Users: ${summary.typeMismatches.users.map(m => `${m.field}(${m.expected}→${m.actual})`).join(', ')}`)
      }
      if (summary.typeMismatches.queue.length > 0) {
        console.log(`   Queue: ${summary.typeMismatches.queue.map(m => `${m.field}(${m.expected}→${m.actual})`).join(', ')}`)
      }
    }
    
    // Expected mappings
    console.log('\n📋 EXPECTED FIELD MAPPINGS')
    console.log('='.repeat(50))
    console.log('\nUsers Table:')
    Object.entries(data.expectedMappings.users).forEach(([field, type]) => {
      console.log(`   ${field}: ${type}`)
    })
    
    console.log('\nQueue Table:')
    Object.entries(data.expectedMappings.queue).forEach(([field, type]) => {
      console.log(`   ${field}: ${type}`)
    })
    
    console.log('\n' + '='.repeat(50))
    console.log(`Final Result: ${data.status === 'PASS' ? '🎉 ALL TESTS PASSED' : '⚠️  ISSUES DETECTED'}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Make sure your Next.js development server is running on http://localhost:3000')
  }
}

// Run the test
testFieldMapping() 