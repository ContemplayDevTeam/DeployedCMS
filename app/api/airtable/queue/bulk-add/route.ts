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
    const { email, queueItems } = await request.json()
    console.log('📋 Request data:', { 
      email, 
      queueItemCount: queueItems?.length || 0 
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

    // Verify user exists and is verified
    console.log('👤 Looking up user:', email)
    const user = await airtable.getUser(email)
    if (!user) {
      console.error('❌ User not found:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ User found:', { id: user.id, isVerified: user.isVerified })

    if (!user.isVerified) {
      console.error('❌ User not verified:', email)
      return NextResponse.json(
        { error: 'User not verified' },
        { status: 403 }
      )
    }

    // Process each queue item
    console.log('📤 Processing queue items:', queueItems.length)
    
    const results = []
    const errors = []

    for (let i = 0; i < queueItems.length; i++) {
      const item = queueItems[i]
      
      try {
        console.log(`📤 Queuing item ${i + 1}/${queueItems.length}:`, {
          fileName: item.fileName,
          fileSize: item.fileSize,
          imageUrl: item.imageUrl
        })

        const queueItem = await airtable.queueImage(email, {
          url: item.imageUrl,
          name: item.fileName,
          size: item.fileSize,
          notes: item.notes || 'Uploaded via web interface',
          publishDate: item.publishDate,
          metadata: item.metadata
        })

        console.log(`✅ Item ${i + 1} queued successfully:`, queueItem.id)
        results.push({
          originalId: item.id,
          queueItemId: queueItem.id,
          fileName: item.fileName,
          status: 'success'
        })

      } catch (error) {
        console.error(`❌ Failed to queue item ${i + 1}:`, error)
        errors.push({
          originalId: item.id,
          fileName: item.fileName,
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