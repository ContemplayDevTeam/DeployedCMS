import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

export async function POST(request: NextRequest) {
  console.log('📤 Move banked image to queue endpoint called')

  try {
    const { email, recordId, publishDate, imageData, workspaceCode } = await request.json()

    if (!email || !recordId) {
      return NextResponse.json(
        { error: 'Email and record ID are required' },
        { status: 400 }
      )
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    if (!apiKey || !baseId) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Map workspace code to experience type Airtable record ID
    const workspaceToExperienceType: Record<string, string> = {
      'homegrownnationalpark': 'recquHAhmVdggGNOp',
      'hnp': 'recquHAhmVdggGNOp'
    }

    // Determine experience type based on workspace code
    const experienceType = workspaceCode
      ? workspaceToExperienceType[workspaceCode.toLowerCase()] || undefined
      : undefined

    console.log('🏷️ Experience Type mapping:', {
      workspaceCode: workspaceCode || 'none',
      experienceType: experienceType || 'not set (should be recquHAhmVdggGNOp for HNP)'
    })

    // Now send to Airtable Queue
    const queueItem = await airtable.queueImage(email, {
      url: imageData.imageUrl,
      name: imageData.fileName,
      size: imageData.fileSize,
      notes: imageData.notes,
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      metadata: imageData.metadata,
      tags: imageData.tags,
      owner: imageData.owner,
      experienceType: experienceType
    })

    console.log('✅ Successfully moved banked image to Airtable queue:', queueItem.id)

    return NextResponse.json({
      success: true,
      message: 'Image moved to queue successfully',
      queueItem
    })
  } catch (error) {
    console.error('💥 Error moving banked image to queue:', error)
    return NextResponse.json(
      { error: 'Failed to move image to queue' },
      { status: 500 }
    )
  }
}
