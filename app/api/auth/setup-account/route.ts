import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email, password, workspaceCode } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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

    console.log('🔐 Setting up account for:', email)

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate a unique firebaseUid based on email and timestamp
    const firebaseUid = `workspace_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        console.log('✅ User already exists, updating password')
        // Update existing user with password
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            preferences: {
              ...(existingUser.preferences as Record<string, unknown> || {}),
              hashedPassword,
              workspaceCode: workspaceCode || null,
              accountSetupComplete: true,
              setupDate: new Date().toISOString()
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Account setup complete! You can now login with your email and password.',
          userId: updatedUser.id,
          email: updatedUser.email
        })
      } else {
        console.log('🆕 Creating new user with password')
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            firebaseUid,
            email,
            preferences: {
              hashedPassword,
              workspaceCode: workspaceCode || null,
              accountSetupComplete: true,
              setupDate: new Date().toISOString()
            }
          }
        })

        return NextResponse.json({
          success: true,
          message: 'Account created successfully! You can now login with your email and password.',
          userId: newUser.id,
          email: newUser.email
        })
      }
    } catch (dbError: unknown) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save account information to database' },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    console.error('💥 SETUP ACCOUNT ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup account' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
