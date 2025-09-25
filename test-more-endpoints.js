// Additional API endpoint tests
const baseUrl = 'http://localhost:3001';
const testEmail = 'ben@contemplay.ai';

async function testMoreEndpoints() {
  console.log('🧪 Testing Additional Enhanced Endpoints...\n');

  try {
    // Test queue with enhanced fields - add an image with new fields
    console.log('1️⃣ Testing enhanced queue/add with new fields...');
    const addResponse = await fetch(`${baseUrl}/api/airtable/queue/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        imageData: {
          url: 'https://example.com/test-image.jpg',
          name: 'test-enhanced-upload.jpg',
          size: 1024000,
          notes: 'Test upload with enhanced fields',
          tags: ['test', 'enhanced', 'api'],
          priority: 7,
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG',
            camera: 'Test Camera'
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
        tags: addData.queueItem.tags,
        fileSize: addData.queueItem.fileSize
      });

      // Test tags endpoint with the new item
      if (addData.queueItem.id) {
        console.log('\n2️⃣ Testing queue/tags endpoint...');
        const tagsResponse = await fetch(`${baseUrl}/api/airtable/queue/tags?email=${encodeURIComponent(testEmail)}&tag=enhanced`);

        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          console.log('✅ Tags filter API works!');
          console.log('🏷️ Items with "enhanced" tag:', tagsData.queueItems.length);
        } else {
          console.log('❌ Tags API failed:', tagsResponse.status);
        }

        // Test processing time endpoint
        console.log('\n3️⃣ Testing processing-time endpoint...');
        const processingResponse = await fetch(`${baseUrl}/api/airtable/queue/processing-time`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recordId: addData.queueItem.id,
            processingTimeSeconds: 45
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

    // Test getting updated user profile to see stats increment
    console.log('\n4️⃣ Testing user stats after upload...');
    const updatedProfileResponse = await fetch(`${baseUrl}/api/airtable/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    if (updatedProfileResponse.ok) {
      const updatedProfileData = await updatedProfileResponse.json();
      console.log('✅ User stats updated!');
      console.log('📊 Updated stats:', {
        totalUploads: updatedProfileData.user.totalUploads,
        storageUsed: updatedProfileData.user.storageUsed,
        lastActivity: updatedProfileData.user.lastActivity
      });
    }

    console.log('\n🎉 All Enhanced API Tests Complete!');

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

testMoreEndpoints();