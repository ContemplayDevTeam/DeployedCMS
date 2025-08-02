import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🧪 Cloudinary test endpoint called')
  
  try {
    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default'
    
    console.log('🔧 Cloudinary config check:', {
      cloudName: cloudName ? 'Present' : 'Missing',
      apiKey: apiKey ? 'Present' : 'Missing',
      apiSecret: apiSecret ? 'Present' : 'Missing',
      uploadPreset
    })

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          error: 'Missing Cloudinary configuration',
          missingConfig: {
            cloudName: !cloudName,
            apiKey: !apiKey,
            apiSecret: !apiSecret
          }
        },
        { status: 500 }
      )
    }

    // Test Cloudinary connectivity with a simple ping
    console.log('🔗 Testing Cloudinary connectivity...')
    const testResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/ping`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
        }
      }
    )

    console.log('📡 Ping response status:', testResponse.status)
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.error('❌ Cloudinary ping failed:', errorText)
      return NextResponse.json(
        { 
          error: 'Cloudinary connectivity test failed',
          status: testResponse.status,
          details: errorText
        },
        { status: 500 }
      )
    }

    // Test upload preset
    console.log('📋 Testing upload preset...')
    console.log('🔍 Checking preset:', uploadPreset)
    console.log('🔗 Preset URL:', `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${uploadPreset}`)
    
    const presetResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets/${uploadPreset}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
        }
      }
    )

    console.log('📡 Preset response status:', presetResponse.status)
    console.log('📡 Preset response headers:', Object.fromEntries(presetResponse.headers.entries()))
    
    let presetInfo = null
    let presetError = null
    
    if (presetResponse.ok) {
      presetInfo = await presetResponse.json()
      console.log('✅ Upload preset found:', presetInfo.name)
    } else {
      presetError = await presetResponse.text()
      console.error('❌ Upload preset not found:', presetError)
    }

    return NextResponse.json({
      success: true,
      config: {
        cloudName,
        apiKey: apiKey ? 'Present' : 'Missing',
        apiSecret: apiSecret ? 'Present' : 'Missing',
        uploadPreset
      },
      connectivity: {
        ping: testResponse.ok,
        pingStatus: testResponse.status
      },
      uploadPreset: {
        exists: presetResponse.ok,
        status: presetResponse.status,
        name: uploadPreset,
        info: presetInfo,
        error: presetError
      }
    })

  } catch (error) {
    console.error('💥 Cloudinary test error:', error)
    return NextResponse.json(
      { 
        error: 'Cloudinary test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 