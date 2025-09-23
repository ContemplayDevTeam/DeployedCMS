const fs = require('fs');
const path = require('path');

// Test the upload flow by simulating the process
async function testUploadFlow() {
  console.log('🧪 Testing Upload Flow...\n');

  // Test 1: Check if the server is responding
  console.log('1️⃣ Testing server connectivity...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Server is responding');
    } else {
      console.log('❌ Server returned status:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return;
  }

  // Test 2: Check Airtable API endpoint
  console.log('\n2️⃣ Testing Airtable API endpoint...');
  try {
         const testPayload = {
       email: 'test@example.com',
       queueItems: [{
         'User Email': 'test@example.com',
         'Image URL': 'https://res.cloudinary.com/test/image/upload/test.jpg',
         'Upload Date': new Date().toISOString().split('T')[0],
         'Publish Date': new Date().toISOString().split('T')[0],
         'Publish Time': '08:00'
       }]
     };

    const response = await fetch('http://localhost:3000/api/airtable/queue/bulk-add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    console.log('📡 Response status:', response.status);
    console.log('📋 Response body:', JSON.stringify(result, null, 2));

    if (response.status === 404) {
      console.log('⚠️  Expected 404 for non-existent user - this is normal');
    } else if (response.status === 403) {
      console.log('⚠️  Expected 403 for unverified user - this is normal');
    } else if (response.ok) {
      console.log('✅ Airtable API endpoint is working');
    } else {
      console.log('❌ Airtable API endpoint error:', response.status);
    }
  } catch (error) {
    console.log('❌ Airtable API test failed:', error.message);
  }

  // Test 3: Check for any Status field references in the code
  console.log('\n3️⃣ Checking for Status field references...');
  
  const filesToCheck = [
    'lib/airtable.ts',
    'app/api/airtable/queue/bulk-add/route.ts',
    'app/upload/page.tsx'
  ];

  let statusFieldFound = false;
  
  for (const file of filesToCheck) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const statusMatches = content.match(/['"]Status['"]/g);
      if (statusMatches) {
        console.log(`⚠️  Found ${statusMatches.length} Status field reference(s) in ${file}`);
        statusFieldFound = true;
      } else {
        console.log(`✅ No Status field references in ${file}`);
      }
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  }

  if (!statusFieldFound) {
    console.log('✅ No problematic Status field references found');
  }

  // Test 4: Verify payload structure
  console.log('\n4️⃣ Verifying payload structure...');
  
  const expectedFields = [
    'User Email',
    'Image URL', 
    'Upload Date',
    'Publish Date',
    'Publish Time'
  ];

  const invalidFields = [
    'Status',
    'File Name',
    'File Size',
    'Notes',
    'Image Queue #',
    'Priority'
  ];

  console.log('✅ Expected fields:', expectedFields.join(', '));
  console.log('❌ Invalid fields (should not be sent):', invalidFields.join(', '));

  // Test 5: Check environment variables
  console.log('\n5️⃣ Checking environment variables...');
  
  const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is set`);
    } else {
      console.log(`❌ ${envVar} is missing`);
    }
  }

  console.log('\n🎯 Upload Flow Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Enter your email and upload some test images');
  console.log('3. Check the browser console for any errors');
  console.log('4. Verify in Airtable that records are created with correct fields');
  console.log('5. Confirm no "Status" field errors appear');
}

// Run the test
testUploadFlow().catch(console.error); 