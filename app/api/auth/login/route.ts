import { NextRequest, NextResponse } from 'next/server'
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

    if (!password) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Password is required' },
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

    // Password-based login (always required now)
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

    // If we get here, password was not provided (shouldn't happen with validation above)
    await prisma.$disconnect()
    return NextResponse.json(
      { error: 'Password is required' },
      { status: 400 }
    )

  } catch (err: unknown) {
    console.error("💥 LOGIN ERROR:", err);
    await prisma.$disconnect()
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 