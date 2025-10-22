import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasBrevoApiKey: !!process.env.BREVO_API_KEY,
    hasBrevoSenderEmail: !!process.env.BREVO_SENDER_EMAIL,
    hasBrevoSenderName: !!process.env.BREVO_SENDER_NAME,
    hasNextPublicBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
    nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    brevoApiKeyLength: process.env.BREVO_API_KEY?.length || 0,
    brevoSenderEmail: process.env.BREVO_SENDER_EMAIL || 'NOT_SET'
  })
}
