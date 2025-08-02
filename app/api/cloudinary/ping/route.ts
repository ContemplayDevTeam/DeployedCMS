import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log('🔍 Testing Cloudinary configuration...')
    
    // Check environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('🔧 Cloudinary config check:', {
      cloudName: cloudName ? 'Present' : 'Missing',
      apiKey: apiKey ? 'Present' : 'Missing',
      apiSecret: apiSecret ? 'Present' : 'Missing'
    });

    // Check if all required config is present
    const missingConfig = [];
    if (!cloudName) missingConfig.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missingConfig.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missingConfig.push('CLOUDINARY_API_SECRET');

    if (missingConfig.length > 0) {
      console.error('❌ Missing Cloudinary configuration:', missingConfig);
      return NextResponse.json({ 
        error: 'Missing Cloudinary configuration',
        missingConfig,
        config: {
          cloudName: cloudName ? 'Present' : 'Missing',
          apiKey: apiKey ? 'Present' : 'Missing',
          apiSecret: apiSecret ? 'Present' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test basic connectivity to Cloudinary
    console.log('📡 Testing Cloudinary API connectivity...');
    
    try {
      const testRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?max_results=1`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}`
        }
      });

      if (testRes.ok) {
        console.log('✅ Cloudinary API connectivity test successful');
        return NextResponse.json({ 
          success: true,
          message: 'Cloudinary configuration is valid and API is accessible',
          config: {
            cloudName: 'Present',
            apiKey: 'Present',
            apiSecret: 'Present'
          }
        });
      } else {
        console.error('❌ Cloudinary API connectivity test failed:', testRes.status);
        return NextResponse.json({ 
          error: 'Cloudinary API connectivity test failed',
          status: testRes.status,
          config: {
            cloudName: 'Present',
            apiKey: 'Present',
            apiSecret: 'Present'
          }
        }, { status: 500 });
      }
    } catch (error) {
      console.error('❌ Cloudinary API connectivity test error:', error);
      return NextResponse.json({ 
        error: 'Cloudinary API connectivity test error',
        details: error instanceof Error ? error.message : 'Unknown error',
        config: {
          cloudName: 'Present',
          apiKey: 'Present',
          apiSecret: 'Present'
        }
      }, { status: 500 });
    }

  } catch (err: unknown) {
    console.error("🔥 Cloudinary test failed:", err);
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 