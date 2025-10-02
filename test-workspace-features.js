// Test script for workspace sharing and password-based themes
// Run with: node test-workspace-features.js

const BASE_URL = 'http://localhost:3002'

async function testPasswordTheme() {
  console.log('\n🧪 Testing Password-Based Theme...\n')

  const testCases = [
    { password: 'hnp2024', expected: 'homegrownnationalpark' },
    { password: 'homegrown', expected: 'homegrownnationalpark' },
    { password: 'invalid', expected: 'default' }
  ]

  for (const test of testCases) {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        themePassword: test.password
      })
    })

    const data = await response.json()

    if (response.ok) {
      console.log(`✅ Password: "${test.password}" → Login successful`)
      console.log(`   Expected theme: ${test.expected}`)
    } else {
      console.log(`⚠️  Password: "${test.password}" → ${data.error}`)
    }
  }
}

async function testEmailInvite() {
  console.log('\n🧪 Testing Email Invite API...\n')

  const inviteData = {
    email: 'teammate@example.com',
    message: 'Join our HNP workspace!',
    workspaceCode: 'hnp2024',
    senderEmail: 'admin@homegrownnationalpark.org'
  }

  try {
    const response = await fetch(`${BASE_URL}/api/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteData)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Email invite sent successfully')
      console.log('   Response:', JSON.stringify(data, null, 2))
    } else {
      console.log('❌ Invite failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

async function testInvalidEmail() {
  console.log('\n🧪 Testing Invalid Email Validation...\n')

  const response = await fetch(`${BASE_URL}/api/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'not-an-email',
      workspaceCode: 'hnp2024'
    })
  })

  const data = await response.json()

  if (response.status === 400) {
    console.log('✅ Invalid email rejected correctly')
    console.log('   Error message:', data.error)
  } else {
    console.log('❌ Should have rejected invalid email')
  }
}

async function runAllTests() {
  console.log('🚀 Starting Workspace Features Tests...')
  console.log('📍 Server:', BASE_URL)

  await testPasswordTheme()
  await testEmailInvite()
  await testInvalidEmail()

  console.log('\n✨ All tests completed!\n')
}

runAllTests().catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})
