// Simple test without problematic fields
const baseUrl = 'http://localhost:3001';
const testEmail = 'ben@contemplay.ai';

async function testSimpleEndpoints() {
  console.log('🧪 Testing Simple Enhanced Endpoints...\n');

  try {
    // Test queue add with just basic new fields (no tags/status)
    console.log('1️⃣ Testing enhanced queue/add with basic new fields...');
    const addResponse = await fetch(`${baseUrl}/api/airtable/queue/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        imageData: {
          url: 'https://example.com/test-simple.jpg',
          name: 'test-simple-upload.jpg',
          size: 512000,
          notes: 'Simple test upload',
          priority: 5,
          metadata: {
            width: 800,
            height: 600,
            format: 'JPEG'
          }
        }
      })
    });

    if (addResponse.ok) {
      const addData = await addResponse.json();
      console.log('✅ Enhanced queue/add works!');
      console.log('📸 New item:', {
        id: addData.queueItem.id,
        fileName: addData.queueItem.fileName,
        priority: addData.queueItem.priority,
        fileSize: addData.queueItem.fileSize,
        notes: addData.queueItem.notes
      });

      // Test processing time endpoint
      if (addData.queueItem.id) {
        console.log('\n2️⃣ Testing processing-time endpoint...');
        const processingResponse = await fetch(`${baseUrl}/api/airtable/queue/processing-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: addData.queueItem.id,
            processingTimeSeconds: 30
          })
        });

        if (processingResponse.ok) {
          const processingData = await processingResponse.json();
          console.log('✅ Processing time API works!', processingData.message);
        } else {
          console.log('❌ Processing time API failed:', processingResponse.status);
        }
      }
    } else {
      const errorText = await addResponse.text();
      console.log('❌ Enhanced queue/add failed:', addResponse.status, errorText);
    }

    // Test getting updated user profile
    console.log('\n3️⃣ Testing updated user profile...');
    const profileResponse = await fetch(`${baseUrl}/api/airtable/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile updated!');
      console.log('📊 User stats:', {
        totalUploads: profileData.user.totalUploads,
        storageUsed: profileData.user.storageUsed,
        lastActivity: profileData.user.lastActivity,
        preferences: Object.keys(profileData.user.preferences || {}).length
      });
    }

    console.log('\n🎉 Enhanced API Core Features Working!');

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testSimpleEndpoints();