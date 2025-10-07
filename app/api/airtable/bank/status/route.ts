import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Return success - client will read from localStorage
    // This endpoint is now just a placeholder
    return NextResponse.json({
      success: true,
      bankedItems: [] // Client-side will populate this from localStorage
    })
  } catch (error) {
    console.error('Error getting bank status:', error)
    return NextResponse.json(
      { error: 'Failed to get bank status' },
      { status: 500 }
    )
  }
}
