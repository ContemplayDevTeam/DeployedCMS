import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { messageId, score } = await request.json()

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    if (score === undefined || score < 0 || score > 10) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 10' },
        { status: 400 }
      )
    }

    console.log(`📊 Updating message ${messageId} score to ${score}`)

<<<<<<< Updated upstream
    // Update the message score
=======
>>>>>>> Stashed changes
    const updatedMessage = await prisma.message.update({
      where: {
        id: parseInt(messageId)
      },
      data: {
        score: score
      }
    })

    console.log(`✅ Message score updated successfully`)

    return NextResponse.json({
      success: true,
      message: updatedMessage
    })
  } catch (error) {
    console.error('❌ Error updating message score:', error)
    return NextResponse.json(
      {
        error: 'Failed to update message score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
