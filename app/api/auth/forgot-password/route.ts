import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as brevo from '@getbrevo/brevo'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

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

    console.log('🔐 Password reset requested for:', email)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      console.log('⚠️ User not found, but returning success to prevent enumeration')
      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      })
    }

    // Generate reset token (email:timestamp encoded in base64)
    const timestamp = Date.now()
    const tokenData = `${email}:${timestamp}`
    const resetToken = Buffer.from(tokenData).toString('base64')

    // Generate reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`

    console.log('🔗 Password reset link:', resetLink)

    // Send email via Brevo if API key is configured
    const brevoApiKey = process.env.BREVO_API_KEY
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL
    const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Workspace Team'

    if (brevoApiKey && brevoSenderEmail) {
      try {
        const apiInstance = new brevo.TransactionalEmailsApi()
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey)

        const sendSmtpEmail = new brevo.SendSmtpEmail()
        sendSmtpEmail.subject = 'Reset Your Password'
        sendSmtpEmail.sender = { name: brevoSenderName, email: brevoSenderEmail }
        sendSmtpEmail.to = [{ email: email }]
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetLink}"
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 12px; border-radius: 6px; word-break: break-all;">
              ${resetLink}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this password reset, you can safely ignore this email.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 11px;">Sent from the Workspace Platform</p>
          </div>
        `
        sendSmtpEmail.textContent = `
Reset Your Password

You requested to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, you can safely ignore this email.

---
Sent from the Workspace Platform
        `

        const emailResult = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Password reset email sent via Brevo:', emailResult)

        await prisma.$disconnect()
        return NextResponse.json({
          success: true,
          message: 'Password reset link sent to your email!'
        })

      } catch (emailError: unknown) {
        console.error('❌ Failed to send email via Brevo:', emailError)
        const error = emailError as { response?: { body?: { message?: string } }; message?: string }
        console.error('❌ Error details:', error?.response?.body || error?.message || emailError)

        await prisma.$disconnect()
        return NextResponse.json({
          success: false,
          error: `Failed to send email: ${error?.response?.body?.message || error?.message || 'Unknown error'}`,
          details: error?.response?.body || null
        }, { status: 500 })
      }
    } else {
      console.log('⚠️ Email service not configured - showing reset link in console')
      console.log('💡 COPY THIS RESET LINK:', resetLink)

      await prisma.$disconnect()
      return NextResponse.json({
        success: true,
        message: 'Password reset link created (check server console)',
        resetLink: resetLink // Only in development
      })
    }

  } catch (error: unknown) {
    console.error('💥 FORGOT PASSWORD ERROR:', error)
    await prisma.$disconnect()
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}
