import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate input
    if (!token) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Reset token is required' },
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

    if (password.length < 6) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Decode the reset token (format: base64(email:timestamp))
    let decodedToken: string
    try {
      decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    } catch {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    const [email, timestamp] = decodedToken.split(':')

    if (!email || !timestamp) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Invalid reset token format' },
        { status: 400 }
      )
    }

    // Check if token is expired (1 hour)
    const tokenAge = Date.now() - parseInt(timestamp)
    const oneHour = 60 * 60 * 1000
    if (tokenAge > oneHour) {
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    console.log('🔐 Resetting password for:', email)

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (!existingUser) {
        await prisma.$disconnect()
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Update user's password
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          preferences: {
            ...(existingUser.preferences as Record<string, unknown> || {}),
            hashedPassword,
            passwordResetDate: new Date().toISOString()
          }
        }
      })

      console.log('✅ Password reset successful for:', email)

      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully!',
        userId: updatedUser.id,
        email: updatedUser.email
      })

    } catch (dbError: unknown) {
      console.error('❌ Database error:', dbError)
      await prisma.$disconnect()
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      )
    }

  } catch (error: unknown) {
    console.error('💥 RESET PASSWORD ERROR:', error)
    await prisma.$disconnect()
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 500 }
    )
  }
}
