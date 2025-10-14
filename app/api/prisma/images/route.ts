import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, experienceType } = await request.json()

    if (!experienceType) {
      return NextResponse.json(
        { error: 'Experience type is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching images for experience type:', experienceType)

    // Query Image table from Prisma filtered by experience type
    // Join with Conversation to get user/owner info
    const conversations = await prisma.conversation.findMany({
      where: {
        experienceType: experienceType
      },
      include: {
        user: true,
        image: true,
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Get the most recent message for each conversation
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent 50 conversations
    })

    // Map to dashboard format
    const images = conversations.map(conv => ({
      id: conv.id.toString(),
      imageUrl: conv.image?.imageUrl || '',
      fileName: conv.imageName,
      uploadDate: conv.createdAt.toISOString(),
      owner: conv.user?.displayName || conv.user?.email || conv.user?.name || 'Unknown',
      experienceType: conv.experienceType,
      approved: true, // Prisma conversations are already created/approved
      status: 'active',
      notes: conv.messages[0]?.message || '' // Most recent message as "notes"
    }))

    console.log(`✅ Found ${images.length} images for ${experienceType}`)

    return NextResponse.json({
      success: true,
      images
    })
  } catch (error) {
    console.error('❌ Error fetching Prisma images:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
