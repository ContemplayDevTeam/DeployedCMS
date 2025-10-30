import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { messageId } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting message ${messageId}`)

<<<<<<< Updated upstream
    // Delete the message
=======
>>>>>>> Stashed changes
    await prisma.message.delete({
      where: {
        id: parseInt(messageId)
      }
    })

    console.log(`✅ Message deleted successfully`)

    return NextResponse.json({
      success: true,
      messageId
    })
  } catch (error) {
    console.error('❌ Error deleting message:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
