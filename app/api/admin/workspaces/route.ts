import { NextRequest, NextResponse } from 'next/server'
import { isAdmin, AVAILABLE_WORKSPACES } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !isAdmin(email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Return list of workspaces for admin
    return NextResponse.json({ workspaces: AVAILABLE_WORKSPACES })
  } catch (error) {
    console.error('Get workspaces error:', error)
    return NextResponse.json(
      { error: 'Failed to get workspaces' },
      { status: 500 }
    )
  }
}
