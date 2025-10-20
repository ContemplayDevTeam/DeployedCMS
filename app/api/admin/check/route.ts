import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check if user is admin
    const adminStatus = isAdmin(email)

    return NextResponse.json({ isAdmin: adminStatus })
  } catch (error) {
    console.error('Admin check error:', error)
    return NextResponse.json({ isAdmin: false })
  }
}
