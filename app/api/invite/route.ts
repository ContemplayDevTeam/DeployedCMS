import { NextRequest, NextResponse } from 'next/server'
import * as brevo from '@getbrevo/brevo'

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

    // Generate invite link (uses NEXT_PUBLIC_BASE_URL from environment)
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
      subject: `Join our ContemPlay Workspace! - ${senderEmail ? senderEmail + ' invited you' : 'You\'re invited'}`,
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

    // Send email via Brevo if API key is configured
    const brevoApiKey = process.env.BREVO_API_KEY
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL
    const brevoSenderName = process.env.BREVO_SENDER_NAME || 'Workspace Team'

    if (brevoApiKey && brevoSenderEmail) {
      try {
        const apiInstance = new brevo.TransactionalEmailsApi()
        apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, brevoApiKey)

        const sendSmtpEmail = new brevo.SendSmtpEmail()
        sendSmtpEmail.subject = `Join our ContemPlay Workspace! - ${senderEmail ? senderEmail + ' invited you' : 'You\'re invited'}`
        // MUST use verified sender email from Brevo account
        sendSmtpEmail.sender = { name: brevoSenderName, email: brevoSenderEmail }
        // Use replyTo to show who sent the invite (optional)
        if (senderEmail) {
          sendSmtpEmail.replyTo = { email: senderEmail }
        }
        sendSmtpEmail.to = [{ email: email }]
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join a workspace!</h2>
            <p>${senderEmail ? `<strong>${senderEmail}</strong> has invited you` : 'You\'ve been invited'} to join their workspace!</p>
            ${message ? `<p><em>"${message}"</em></p>` : ''}
            <div style="margin: 30px 0;">
              <a href="${inviteLink}"
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>When you click this link, you'll be:</p>
            <ul>
              <li>✓ Automatically logged in</li>
              <li>✓ Given access to the workspace theme</li>
              <li>✓ Ready to start collaborating immediately</li>
            </ul>
            <p style="color: #666; font-size: 12px;">This link expires in 30 days.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 11px;">Sent from the Workspace Platform</p>
          </div>
        `
        sendSmtpEmail.textContent = inviteData.body

        const emailResult = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Email sent successfully via Brevo:', emailResult)

        return NextResponse.json({
          success: true,
          message: 'Invitation email sent successfully!',
          inviteLink: inviteLink,
          emailSent: true
        })
      } catch (emailError: unknown) {
        console.error('❌ Failed to send email via Brevo:', emailError)
        const error = emailError as { response?: { body?: { message?: string } }; message?: string }
        console.error('❌ Error details:', error?.response?.body || error?.message || emailError)

        // Return error details to help diagnose the issue
        return NextResponse.json({
          success: false,
          error: `Failed to send email: ${error?.response?.body?.message || error?.message || 'Unknown error'}`,
          details: error?.response?.body || null,
          inviteLink: inviteLink,
          emailSent: false
        }, { status: 500 })
      }
    } else {
      if (!brevoApiKey) {
        console.log('⚠️ BREVO_API_KEY not configured - email not sent')
        console.log('💡 Add BREVO_API_KEY to .env.local to enable email sending')
      }
      if (!brevoSenderEmail) {
        console.log('⚠️ BREVO_SENDER_EMAIL not configured - email not sent')
        console.log('💡 Add a verified sender email to .env.local')
        console.log('💡 Verify your sender at: https://app.brevo.com/settings/senders')
      }
    }

    return NextResponse.json({
      success: true,
      message: (brevoApiKey && brevoSenderEmail) ? 'Invitation email sent successfully' : 'Invitation created (email service not configured - check console for invite link)',
      inviteLink: inviteLink,
      emailSent: !!(brevoApiKey && brevoSenderEmail)
    })

  } catch (error: unknown) {
    console.error('💥 INVITE ERROR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invite' },
      { status: 500 }
    )
  }
}
