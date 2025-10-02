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

    // In a real app, you'd send an actual email here
    // For now, we'll just log it and return success
    console.log('📧 Workspace Invite:', {
      to: email,
      from: senderEmail,
      workspaceCode,
      message: message || 'No message provided'
    })

    // Simulate email sending
    const inviteData = {
      to: email,
      from: senderEmail || 'noreply@workspace.com',
      subject: 'You\'ve been invited to join a workspace',
      body: `
        ${senderEmail ? senderEmail + ' has invited you' : 'You\'ve been invited'} to join their workspace!

        ${message ? message + '\n\n' : ''}
        To join:
        1. Go to the login page
        2. Enter your email
        3. Use workspace code: ${workspaceCode || '[Code not provided]'}

        This will give you access to the workspace theme and shared resources.
      `
    }

    console.log('📨 Email would be sent:', inviteData)

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
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
