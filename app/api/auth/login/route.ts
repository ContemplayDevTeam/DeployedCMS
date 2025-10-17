import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // If password is provided, try password-based login
    if (password) {
      console.log('🔐 Attempting password-based login for:', email)

      try {
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          await prisma.$disconnect()
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }

        const preferences = user.preferences as Record<string, unknown> | null
        const hashedPassword = preferences?.hashedPassword as string | undefined

        if (!hashedPassword) {
          await prisma.$disconnect()
          return NextResponse.json(
            { error: 'No password set for this account. Please use magic link login or set up your password.' },
            { status: 401 }
          )
        }

        const passwordMatch = await bcrypt.compare(password, hashedPassword)

        if (!passwordMatch) {
          await prisma.$disconnect()
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          )
        }

        console.log('✅ Password login successful for:', email)
        await prisma.$disconnect()
        return NextResponse.json({
          success: true,
          userId: user.id.toString(),
          email: user.email,
          workspaceCode: preferences?.workspaceCode as string | null,
          message: 'Login successful'
        })

      } catch (dbError) {
        console.error('❌ Database error during password login:', dbError)
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'Login failed' },
          { status: 500 }
        )
      }
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

    // Removed verification check - if user exists, they can log in (magic link login)

    await prisma.$disconnect()
    return NextResponse.json({
      success: true,
      userId: user.id,
      email: user.email,
      message: 'Login successful'
    })

  } catch (err: unknown) {
    console.error("💥 LOGIN ERROR:", err);
    await prisma.$disconnect()
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 