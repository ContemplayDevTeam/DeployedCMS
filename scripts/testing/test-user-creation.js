#!/usr/bin/env node

/**
 * Test user creation specifically
 * Run with: node test-user-creation.js
 */

const BASE_URL = 'http://localhost:3000'

async function testUserCreation() {
  console.log('🧪 Testing user creation...\n')
  
  try {
    const response = await fetch(`${BASE_URL}/api/airtable/test-user-creation`)
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText)
      console.error('Error details:', data)
      return
    }
    
    // Display results
    console.log('📊 USER CREATION TEST RESULTS\n')
    console.log(`Success: ${data.success ? '✅' : '❌'}`)
    console.log(`Message: ${data.message}\n`)
    
    if (data.success) {
      console.log('🎉 User creation and retrieval test passed!')
      console.log('\n📝 Created User:')
      console.log(`   ID: ${data.createdUser.id}`)
      console.log(`   Email: ${data.createdUser.email}`)
      console.log(`   Verified: ${data.createdUser.isVerified}`)
      
      console.log('\n🔍 Retrieved User:')
      console.log(`   ID: ${data.retrievedUser.id}`)
      console.log(`   Email: ${data.retrievedUser.email}`)
      console.log(`   Verified: ${data.retrievedUser.isVerified}`)
    } else {
      console.log('❌ Test failed')
      if (data.error) {
        console.log(`Error: ${data.error}`)
      }
      if (data.testEmail) {
        console.log(`Test email used: ${data.testEmail}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Make sure your Next.js development server is running on http://localhost:3000')
  }
}

// Run the test
testUserCreation() 