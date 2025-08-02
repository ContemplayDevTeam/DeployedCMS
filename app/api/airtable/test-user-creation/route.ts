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

    console.log('🧪 Testing user creation...')
    
    const airtable = new AirtableBackend(apiKey, baseId)
    const testEmail = `test-${Date.now()}@example.com`
    
    try {
      console.log('📝 Creating test user with email:', testEmail)
      const testUser = await airtable.createUser({ email: testEmail })
      
      console.log('✅ User created successfully:', testUser.id)
      
      // Test retrieval
      console.log('🔍 Testing user retrieval...')
      const retrievedUser = await airtable.getUserByEmail(testEmail)
      
      if (retrievedUser && retrievedUser.email === testEmail) {
        console.log('✅ User retrieval successful')
        
        return NextResponse.json({
          success: true,
          message: 'User creation and retrieval test passed',
          createdUser: {
            id: testUser.id,
            email: testUser.email,
            isVerified: testUser.isVerified
          },
          retrievedUser: {
            id: retrievedUser.id,
            email: retrievedUser.email,
            isVerified: retrievedUser.isVerified
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          message: 'User creation succeeded but retrieval failed',
          createdUser: {
            id: testUser.id,
            email: testUser.email
          },
          retrievedUser: retrievedUser
        })
      }
      
    } catch (error) {
      console.error('❌ User creation/retrieval failed:', error)
      
      return NextResponse.json({
        success: false,
        message: 'User creation/retrieval test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        testEmail: testEmail
      })
    }
    
  } catch (error) {
    console.error('Test user creation error:', error)
    return NextResponse.json({
      error: 'Failed to test user creation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 