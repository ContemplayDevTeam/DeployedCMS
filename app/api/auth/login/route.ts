import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Test mode for theme demonstration - allows specific test emails
    const testEmails = [
      'test@homegrownnationalpark.org',
      'demo@homegrownnationalpark.org',
      'admin@homegrownnationalpark.org'
    ]

    if (testEmails.includes(email.toLowerCase())) {
      return NextResponse.json({
        success: true,
        userId: 'test-user-' + email.split('@')[0],
        email: email,
        message: 'Test login successful (demo mode)'
      })
    }

    // Check environment variables
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Get user by email
    const user = await airtable.getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 401 }
      )
    }

    // Removed verification check - if user exists, they can log in

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      message: 'Login successful'
    })

  } catch (err: unknown) {
    console.error("💥 LOGIN ERROR:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 