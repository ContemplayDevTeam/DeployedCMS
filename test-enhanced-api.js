// Test script for enhanced API endpoints
const baseUrl = 'http://localhost:3001';

// Test user from your existing data
const testEmail = 'ben@contemplay.ai';

async function testAPI() {
  console.log('🧪 Testing Enhanced API Endpoints...\n');

  try {
    // Test 1: Get user profile with new fields
    console.log('1️⃣ Testing GET user profile...');
    const profileResponse = await fetch(`${baseUrl}/api/airtable/user/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile API works!');
      console.log('📊 User data:', {
        email: profileData.user.email,
        totalUploads: profileData.user.totalUploads,
        storageUsed: profileData.user.storageUsed,
        lastActivity: profileData.user.lastActivity,
        subscriptionTier: profileData.user.subscriptionTier
      });
    } else {
      console.log('❌ Profile API failed:', profileResponse.status, await profileResponse.text());
    }

    console.log('\n2️⃣ Testing GET queue status with new fields...');
    const queueResponse = await fetch(`${baseUrl}/api/airtable/queue/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    if (queueResponse.ok) {
      const queueData = await queueResponse.json();
      console.log('✅ Queue status API works!');
      console.log('📦 Queue items found:', queueData.queueItems.length);
      if (queueData.queueItems.length > 0) {
        const firstItem = queueData.queueItems[0];
        console.log('📸 First item details:', {
          fileName: firstItem.fileName,
          status: firstItem.status,
          fileSize: firstItem.fileSize,
          priority: firstItem.priority,
          tags: firstItem.tags
        });
      }
    } else {
      console.log('❌ Queue status API failed:', queueResponse.status, await queueResponse.text());
    }

    console.log('\n3️⃣ Testing preferences API...');
    // Test setting preferences
    const preferencesResponse = await fetch(`${baseUrl}/api/airtable/user/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        preferences: {
          theme: 'dark',
          notifications: true,
          defaultTags: ['test', 'api'],
          autoPublish: false
        }
      })
    });

    if (preferencesResponse.ok) {
      const prefData = await preferencesResponse.json();
      console.log('✅ Preferences SET API works!', prefData.message);

      // Now get preferences
      const getPrefsResponse = await fetch(`${baseUrl}/api/airtable/user/preferences?email=${encodeURIComponent(testEmail)}`);
      if (getPrefsResponse.ok) {
        const getPrefData = await getPrefsResponse.json();
        console.log('✅ Preferences GET API works!');
        console.log('⚙️ User preferences:', getPrefData.preferences);
      } else {
        console.log('❌ Get preferences failed:', getPrefsResponse.status);
      }
    } else {
      console.log('❌ Set preferences API failed:', preferencesResponse.status, await preferencesResponse.text());
    }

    console.log('\n🎉 API Testing Complete!');

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Run the tests
testAPI();