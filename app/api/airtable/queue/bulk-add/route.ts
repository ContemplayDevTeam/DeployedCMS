import { NextRequest, NextResponse } from 'next/server'
import { AirtableBackend } from '@/lib/airtable'

// interface QueueItem {
//   id: string
//   file: File
//   imageUrl: string
//   fileName: string
//   fileSize: number
//   notes?: string
//   publishDate?: string
//   metadata?: Record<string, unknown>
// }

export async function POST(request: NextRequest) {
  console.log('🚀 Airtable bulk queue add endpoint called')

  try {
    const { email, queueItems, workspaceCode } = await request.json()
    console.log('📋 Request data:', {
      email,
      queueItemCount: queueItems?.length || 0,
      workspaceCode: workspaceCode || 'none'
    })

    if (!email || !queueItems || !Array.isArray(queueItems) || queueItems.length === 0) {
      console.error('❌ Missing or invalid data:', { 
        email: !!email, 
        queueItems: !!queueItems, 
        isArray: Array.isArray(queueItems),
        length: queueItems?.length 
      })
      return NextResponse.json(
        { error: 'Email and non-empty queue items array are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID

    console.log('🔧 Airtable config check:', {
      apiKey: apiKey ? 'Present' : 'Missing',
      baseId: baseId ? 'Present' : 'Missing'
    })

    if (!apiKey || !baseId) {
      console.error('❌ Missing Airtable configuration')
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      )
    }

    const airtable = new AirtableBackend(apiKey, baseId)

    // Verify user exists (removed verification check - if they logged in, they can upload)
    console.log('👤 Looking up user:', email)
    const user = await airtable.getUser(email)
    if (!user) {
      console.error('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', { id: user.id })

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
      workspaceCode,
      experienceType: experienceType || 'not set (should be recquHAhmVdggGNOp for HNP)'
    })

    // Process each queue item
    console.log('📤 Processing queue items:', queueItems.length)

    const results = []
    const errors = []

    for (let i = 0; i < queueItems.length; i++) {
      const item = queueItems[i]

      try {
        console.log(`📤 Queuing item ${i + 1}/${queueItems.length}:`, {
          imageUrl: item['Image URL'],
          uploadDate: item['Upload Date'],
          publishDate: item['Publish Date'],
          experienceType: experienceType || 'not set'
        })

        const queueItem = await airtable.queueImage(email, {
          url: item['Image URL'],
          name: 'Uploaded Image', // Default name since it's not in the payload
          size: 0, // Default size since it's not in the payload
          notes: 'Uploaded via web interface',
          publishDate: item['Publish Date'],
          metadata: {},
          experienceType: experienceType
        })

        console.log(`✅ Item ${i + 1} queued successfully:`, queueItem.id)
        results.push({
          originalId: i.toString(),
          queueItemId: queueItem.id,
          fileName: 'Uploaded Image',
          status: 'success'
        })

      } catch (error) {
        console.error(`❌ Failed to queue item ${i + 1}:`, error)
        errors.push({
          originalId: i.toString(),
          fileName: 'Uploaded Image',
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error'
        })
      }
    }

    console.log('📊 Bulk queue results:', {
      total: queueItems.length,
      successful: results.length,
      failed: errors.length
    })

    return NextResponse.json({
      success: true,
      summary: {
        total: queueItems.length,
        successful: results.length,
        failed: errors.length
      },
      results,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('💥 Error in bulk queue add:', error)
    
    // Provide detailed error information
    let errorMessage = 'Failed to process bulk queue'
    let errorDetails = {}
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorDetails = {
        name: error.name,
        stack: error.stack,
        message: error.message
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 