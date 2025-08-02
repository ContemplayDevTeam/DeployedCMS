const fs = require('fs');
const path = require('path');

async function testUpload() {
  console.log('🧪 Testing upload endpoint...');
  
  try {
    // Test 1: Check if the endpoint is reachable
    console.log('\n1️⃣ Testing endpoint availability...');
    const healthCheck = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: new FormData()
    });
    
    console.log('Health check status:', healthCheck.status);
    
    // Test 2: Test Cloudinary configuration
    console.log('\n2️⃣ Testing Cloudinary configuration...');
    const configTest = await fetch('http://localhost:3000/api/cloudinary/test');
    const configResult = await configTest.json();
    console.log('Cloudinary config test:', JSON.stringify(configResult, null, 2));
    
    // Test 3: Test with a small sample image (if available)
    console.log('\n3️⃣ Testing with sample image...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const formData = new FormData();
    const blob = new Blob([testImageData], { type: 'image/png' });
    formData.append('file', blob, 'test.png');
    
    const uploadTest = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadTest.json();
    console.log('Upload test result:', JSON.stringify(uploadResult, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testUpload();
}

module.exports = { testUpload }; 