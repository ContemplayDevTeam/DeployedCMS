import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID
  
  return NextResponse.json({
    apiKey: apiKey ? 'Present' : 'Missing',
    baseId: baseId ? 'Present' : 'Missing',
    apiKeyLength: apiKey ? apiKey.length : 0,
    baseIdValue: baseId || 'Not set'
  })
} 