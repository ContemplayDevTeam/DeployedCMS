import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, message, workspaceCode, senderEmail } = await request.json()

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

    if (!workspaceCode) {
      return NextResponse.json(
        { error: 'Workspace code is required' },
        { status: 400 }
      )
    }

    // Generate unique invite token (email:workspaceCode:timestamp encoded in base64)
    const timestamp = Date.now()
    const tokenData = `${email}:${workspaceCode}:${timestamp}`
    const inviteToken = Buffer.from(tokenData).toString('base64')

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/accept-invite?token=${inviteToken}`

    console.log('📧 Workspace Invite:', {
      to: email,
      from: senderEmail,
      workspaceCode,
      message: message || 'No message provided',
      inviteLink
    })

    // TODO: Replace with actual email service (SendGrid, Resend, AWS SES, etc.)
    // For now, this simulates email sending - the invite link is logged to console
    const inviteData = {
      to: email,
      from: senderEmail || 'noreply@workspace.com',
      subject: `${senderEmail ? senderEmail + ' invited' : 'You\'re invited'} - Join our workspace!`,
      body: `
Hi there!

${senderEmail ? senderEmail + ' has invited you' : 'You\'ve been invited'} to join their workspace!

${message ? message + '\n\n' : ''}
Click the link below to get instant access - no password needed:
${inviteLink}

When you click this link, you'll be:
✓ Automatically logged in
✓ Given access to the workspace theme
✓ Ready to start collaborating immediately

This link expires in 30 days.

---
Sent from the Workspace Platform
      `
    }

    console.log('📨 Email would be sent:', inviteData)
    console.log('🔗 COPY THIS INVITE LINK:', inviteLink)

    // INTEGRATION EXAMPLE:
    // Uncomment and configure one of these email services:

    // SendGrid:
    // await sendgrid.send({ to: email, from: 'noreply@yourdomain.com', subject: inviteData.subject, text: inviteData.body })

    // Resend:
    // await resend.emails.send({ from: 'noreply@yourdomain.com', to: email, subject: inviteData.subject, text: inviteData.body })

    // Nodemailer:
    // await transporter.sendMail({ from: senderEmail, to: email, subject: inviteData.subject, text: inviteData.body })

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      inviteLink: inviteLink,
      details: inviteData
    })

  } catch (error: unknown) {
    console.error('💥 INVITE ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invite' },
      { status: 500 }
    )
  }
}
