import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const airtable = new AirtableBackend(
      process.env.AIRTABLE_API_KEY || '',
      process.env.AIRTABLE_BASE_ID || ''
    )

    // Check if user exists, if not create them
    let user = await airtable.getUser(email)
    if (!user) {
      user = await airtable.createUser(email)
    }

    // Verify the user
    const isVerified = await airtable.verifyUser(email)

    return NextResponse.json({
      isVerified,
      user: {
        email: user.email,
        isVerified: user.isVerified,
        isPaid: user.isPaid,
        subscriptionTier: user.subscriptionTier
      }
    })
  } catch (error) {
    console.error('Error in user verification:', error)
    return NextResponse.json(
      { error: 'Failed to verify user' },
      { status: 500 }
    )
  }
} 