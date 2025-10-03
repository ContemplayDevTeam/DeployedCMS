import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('✅ Approve banked image endpoint called (local storage)')

  try {
    const { email, recordId } = await request.json()

    if (!email || !recordId) {
      return NextResponse.json(
        { error: 'Email and record ID are required' },
        { status: 400 }
      )
    }

    console.log('✅ Successfully approved banked image (client-side)')

    return NextResponse.json({
      success: true,
      message: 'Image approved successfully'
    })
  } catch (error) {
    console.error('💥 Error approving banked image:', error)
    return NextResponse.json(
      { error: 'Failed to approve image' },
      { status: 500 }
    )
  }
}
