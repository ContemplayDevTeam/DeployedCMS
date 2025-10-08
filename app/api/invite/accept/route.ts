import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Invite token is required' },
        { status: 400 }
      )
    }

    // Decode the invite token (format: base64(email:workspaceCode:timestamp))
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch {
      return NextResponse.json(
        { error: 'Invalid invite token' },
        { status: 400 }
      )
    }

    const [email, workspaceCode, timestamp] = decodedToken.split(':')

    if (!email || !workspaceCode || !timestamp) {
      return NextResponse.json(
        { error: 'Invalid invite token format' },
        { status: 400 }
      )
    }

    // Check if token is expired (30 days)
    const tokenAge = Date.now() - parseInt(timestamp)
    const thirtyDays = 30 * 24 * 60 * 60 * 1000
    if (tokenAge > thirtyDays) {
      return NextResponse.json(
        { error: 'Invite link has expired. Please request a new invitation.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email in invite token' },
        { status: 400 }
      )
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

    // Check if user already exists
    let user = await airtable.getUserByEmail(email)

    if (!user) {
      // Create new user automatically
      try {
        user = await airtable.createUser({ email })
        console.log('✅ New user created via invite:', email)
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }
    } else {
      console.log('✅ Existing user accepted invite:', email)
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      workspaceCode: workspaceCode,
      message: 'Welcome! You\'re now logged in.'
    })

  } catch (err: unknown) {
    console.error("💥 INVITE ACCEPT ERROR:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
